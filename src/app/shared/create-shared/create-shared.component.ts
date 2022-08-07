import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePickerPlugin, DatePickerPluginInterface } from '@capacitor-community/date-picker';
import { ModalController } from '@ionic/angular';
import { startOfMonth } from 'date-fns';
import { ECashType, IAccount, IIncomeExpense } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-create-shared',
  templateUrl: './create-shared.component.html',
  styleUrls: ['./create-shared.component.scss'],
})
export class CreateSharedComponent implements OnInit {

  @Input() public type: ECashType;
  @Input() public editItem: IIncomeExpense;

  isExpense: boolean;

  public cashForm: FormGroup;
  public currentTime: string = this.common.toLocaleIsoDateString(new Date());
  public allAccounts: IAccount[] = [];

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
      accountId: [this.config.currentAccountId, Validators.required]
    });
  }
  get f() {
    return this.cashForm.controls;
  }

  ngOnInit() {
    if (startOfMonth(new Date()).toLocaleDateString(undefined, { month: 'long' }) !== this.cashService.currentMonthData.month) {
      this.currentTime = this.common.toLocaleIsoDateString(new Date(
        Date.parse(`${this.cashService.currentMonthData.month} 1, ${this.cashService.currentMonthData.year}`)
      ));
      this.cashForm.controls.datetime.setValue(this.currentTime);
    }
    this.type = this.type ?? this.editItem.type;
    this.isExpense = this.type === ECashType.expense;
    if (this.editItem) {
      this.cashForm.patchValue(this.editItem);
      this.cashForm.controls.datetime.setValue(this.common.toLocaleIsoDateString(this.editItem.datetime as Date));
    }
    this.firebase.getUserAccounts().subscribe((accounts) => {
      this.allAccounts = accounts;
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
        accountId: this.cashForm.value.accountId
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

}
