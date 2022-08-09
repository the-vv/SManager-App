import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInput, ModalController } from '@ionic/angular';
import { startOfMonth } from 'date-fns';
import { take } from 'rxjs';
import { ECashType, IAccount, ICategory, IIncomeExpense } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-create-shared',
  templateUrl: './create-shared.component.html',
  styleUrls: ['./create-shared.component.scss'],
})
export class CreateSharedComponent implements OnInit, AfterViewInit {

  @Input() public type: ECashType;
  @Input() public editItem: IIncomeExpense;

  @ViewChild('titleInput') titleInput: IonInput;

  isExpense: boolean;

  public cashForm: FormGroup;
  public currentTime: string = this.common.toLocaleIsoDateString(new Date());
  public allAccounts: IAccount[] = [];
  public allCategories: ICategory[] = [];

  constructor(
    public modalController: ModalController,
    private formBuilder: FormBuilder,
    public cashService: CashService,
    private config: ConfigService,
    private common: CommonService,
    private firebase: FirebaseService
  ) {
    this.cashForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      amount: ['', Validators.required],
      datetime: [this.currentTime, Validators.required],
      accountId: ['', Validators.required],
      categoryId: [null]
    });
  }
  get f() {
    return this.cashForm.controls;
  }

  ngAfterViewInit(): void {
    if (!this.editItem) {
      setTimeout(() => {
        this.titleInput.setFocus();
      }, 400);
    }
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
    if (this.editItem) {
      this.cashForm.patchValue(this.editItem);
      this.cashForm.controls.datetime.setValue(this.common.toLocaleIsoDateString(this.editItem.datetime as Date));
    }
    this.firebase.getUserAccounts().pipe(take(1)).subscribe((accounts) => {
      this.allAccounts = accounts;
      this.cashForm.controls.accountId.setValue(this.editItem?.accountId ?? this.config.currentAccountId);
    });
    this.firebase.getAllUserCategories().pipe(take(1)).subscribe((categories) => {
      this.allCategories = categories?.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  dismissModal() {
    this.modalController.dismiss({
      dismisse: true
    });
  }

  onCreate() {
    if (this.cashForm.valid) {
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
          this.common.showToast(`${this.type.charAt(0).toUpperCase() + this.type.slice(1)} Created Successfully`);
        } else {
          this.cashService.addIncome(body);
          this.dismissModal();
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

}
