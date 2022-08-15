import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInput, ModalController } from '@ionic/angular';
import { startOfMonth } from 'date-fns';
import { Subscription, take } from 'rxjs';
import { EAutomationFrequency, ECashType, FTimeStamp, IAccount, IAutomation, ICategory, IIncomeExpense } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-create-shared',
  templateUrl: './create-shared.component.html',
  styleUrls: ['./create-shared.component.scss'],
})
export class CreateSharedComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {

  @Input() public type: ECashType;
  @Input() public editItem: IIncomeExpense;
  @Input() public isAutomation = false;
  @Input() public automationItem: IAutomation;

  @ViewChildren('categoryItems') categoryLoop: QueryList<any>;
  @ViewChildren('accountItems') accountLoop: QueryList<any>;

  @ViewChild('titleInput') titleInput: IonInput;

  isExpense: boolean;
  frequencyValues = Object.values(EAutomationFrequency);

  public cashForm: FormGroup;
  public currentTime: string = this.common.toLocaleIsoDateString(new Date());
  public allAccounts: IAccount[] = [];
  public allCategories: ICategory[] = [];
  private subs: Subscription = new Subscription();

  constructor(
    public modalController: ModalController,
    private formBuilder: FormBuilder,
    public cashService: CashService,
    private config: ConfigService,
    private common: CommonService,
    private firebase: FirebaseService,
    private cdr: ChangeDetectorRef
  ) {
    this.cashForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      amount: ['', Validators.required],
      datetime: [this.currentTime, Validators.required],
      accountId: ['', Validators.required],
      categoryId: [null],
      frequency: [EAutomationFrequency.monthly],
      automation: false
    });
  }
  get f() {
    return this.cashForm.controls;
  }

  ngAfterViewChecked(): void {
    // this.cdr.detectChanges();
  }
  ngAfterViewInit(): void {
    if (!this.editItem && !this.automationItem) {
      setTimeout(() => {
        this.titleInput.setFocus();
      }, 400);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    if (startOfMonth(new Date()).toLocaleDateString(undefined, { month: 'long' }) !== this.cashService.currentMonthData?.month) {
      this.currentTime = this.common.toLocaleIsoDateString(new Date(
        Date.parse(`${this.cashService.currentMonthData?.month} 1, ${this.cashService.currentMonthData?.year}`)
      ));
      this.cashForm.controls.datetime.setValue(this.currentTime);
    }
    this.type = this.type ?? this.editItem.type;
    this.isExpense = this.type === ECashType.expense;
    this.firebase.getUserAccounts().pipe(take(1)).subscribe((accounts) => {
      this.allAccounts = accounts;
      this.accountLoop.changes.pipe(take(1)).subscribe(() => {
        if (this.automationItem) {
          this.cashForm.controls.accountId.setValue(this.automationItem.accountId);
        } else {
          this.cashForm.controls.accountId.setValue(this.editItem?.accountId ?? this.config.currentAccountId);
        }
      });
    });
    this.firebase.getAllUserCategories().pipe(take(1)).subscribe((categories) => {
      this.allCategories = categories?.sort((a, b) => a.name.localeCompare(b.name));
      this.categoryLoop.changes.pipe(take(1)).subscribe(() => {
        if (this.editItem && !this.allCategories.find(c => c.id === this.editItem.categoryId)) {
          this.cashForm.controls.categoryId.setValue('');
        } else if (this.editItem) {
          this.cashForm.controls.categoryId.setValue(this.editItem?.categoryId ?? '');
        }
        if (this.automationItem && !this.allCategories.find(c => c.id === this.automationItem.categoryId)) {
          this.cashForm.controls.categoryId.setValue('');
        } else if (this.automationItem) {
          this.cashForm.controls.categoryId.setValue(this.automationItem.categoryId);
        }
      });
    });
    if (this.isAutomation) {
      this.cashForm.controls.automation.setValue(true);
    }
    if (this.editItem) {
      this.cashForm.patchValue(this.editItem);
      this.cashForm.controls.datetime.setValue(this.common.toLocaleIsoDateString(this.editItem.datetime as Date));
      this.cashForm.controls.accountId.setValue(''); // for change triggering
      this.cashForm.controls.categoryId.setValue(''); // for change triggering
    }
    if (this.automationItem) {
      this.cashForm.patchValue(this.automationItem);
      const currentDateTime = this.common.toLocaleIsoDateString((this.cashForm.controls.datetime.value as FTimeStamp).toDate());
      this.cashForm.controls.datetime.setValue(currentDateTime);
      this.cashForm.controls.accountId.setValue(''); // for change triggering
      this.cashForm.controls.categoryId.setValue(''); // for change triggering
    }
    this.subs.add(
      this.cashForm.get('datetime').valueChanges.subscribe((value) => {
        if (this.automationItem) {
          if (new Date(value) < (this.automationItem.datetime as FTimeStamp).toDate()) {
            this.common.showToast(`Warning: Changing Automation date may cause already created 
                ${this.type.charAt(0).toUpperCase() + this.type.slice(1)}
                to repeat again according to the new date.`
              , 0);
          }
        }
      })
    );
  }

  dismissModal() {
    this.modalController.dismiss({
      dismisse: true
    });
  }

  onCreate() {
    if (this.cashForm.valid) {
      if (this.cashForm.value.automation && this.isAutomation) {
        this.createAutomation(this.cashForm.value);
        return;
      }
      const body: IIncomeExpense = {
        title: this.cashForm.value.title,
        description: this.cashForm.value.description,
        datetime: new Date(this.cashForm.value.datetime),
        amount: this.cashForm.value.amount,
        type: this.isExpense ? ECashType.expense : ECashType.income,
        synced: false,
        userId: this.config.currentUser.id,
        accountId: this.cashForm.value.accountId,
        categoryId: this.cashForm.value.categoryId
      };
      // console.log(body);
      if (!this.editItem) {
        if (this.isExpense) {
          this.cashService.addExpense(body);
          this.dismissModal();
          if (this.cashForm.value.automation) {
            this.createAutomation(this.cashForm.value);
            return;
          }
          this.common.showToast(`${this.type.charAt(0).toUpperCase() + this.type.slice(1)} Created Successfully`);
        } else {
          this.cashService.addIncome(body);
          this.dismissModal();
          if (this.cashForm.value.automation) {
            this.createAutomation(this.cashForm.value);
            return;
          }
          this.common.showToast(`${this.type.charAt(0).toUpperCase() + this.type.slice(1)} Created Successfully`);
        }
      } else {
        this.cashService.updateItem(body, this.editItem.id);
        this.dismissModal();
        this.common.showToast(`${this.type.charAt(0).toUpperCase() + this.type.slice(1)} Updated Successfully`);
      }
    }
  }

  compareFn(e1: IAccount, e2: IAccount): boolean {
    return e1 && e2 ? e1.id === e2.id : e1 === e2;
  }

  createAutomation(formValue: any) {
    if (!this.automationItem) {
      const body: IAutomation = {
        title: formValue.title,
        description: formValue.description,
        datetime: new Date(formValue.datetime),
        amount: formValue.amount,
        type: this.isExpense ? ECashType.expense : ECashType.income,
        accountId: formValue.accountId,
        categoryId: formValue.categoryId,
        frequency: formValue.frequency,
        userId: this.config.currentUser.id,
        active: true,
        lastExecuted: this.isAutomation ? null : new Date(formValue.datetime)
      };
      this.firebase.createAutomation(body)
        .then(() => {
          if (this.isAutomation) {
            this.common.showToast(`Automation Created Successfully`);
            return;
          }
          this.common.showToast(`${this.type.charAt(0).toUpperCase() + this.type.slice(1)} and Automation Created Successfully`);
        }).catch(err => {
          console.log(err);
        }).finally(() => {
          this.dismissModal();
        });
    } else {
      const updateBody: any = {
        title: formValue.title,
        description: formValue.description,
        datetime: new Date(formValue.datetime),
        amount: formValue.amount,
        accountId: formValue.accountId,
        categoryId: formValue.categoryId,
        frequency: formValue.frequency,
      };
      if (new Date(formValue.datetime) !== (this.automationItem.datetime as FTimeStamp).toDate()) {
        if (new Date(formValue.datetime) < (this.automationItem.datetime as FTimeStamp).toDate()) {
          updateBody.lastExecuted = new Date(formValue.datetime);
        }
        if (new Date(formValue.datetime) > (this.automationItem.datetime as FTimeStamp).toDate()) {
          updateBody.lastExecuted = null;
        }
      }
      this.firebase.updateAutomation(updateBody, this.automationItem.id)
        .then(() => {
          this.common.showToast(`Automation Updated Successfully`);
        }).catch(err => {
          this.common.showToast(`Error in updating automation`);
          console.log(err);
        }).finally(() => {
          this.dismissModal();
        });
    }
  }

}


