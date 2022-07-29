import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePickerPlugin, DatePickerPluginInterface } from '@capacitor-community/date-picker';
import { ModalController } from '@ionic/angular';
import { ECashType, IIncomeExpense } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';
import { ConfigService } from 'src/app/services/config.service';

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
  public currentTime: string = new Date().toISOString();
  private datePicker: DatePickerPluginInterface = DatePickerPlugin;

  constructor(
    public modalController: ModalController,
    private formBuilder: FormBuilder,
    public cashService: CashService,
    private config: ConfigService
  ) {
    this.cashForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      amount: ['', Validators.required],
      datetime: [this.currentTime, Validators.required]
    });
  }
  get f() {
    return this.cashForm.controls;
  }

  ngOnInit() {
    this.type = this.type ?? this.editItem.type;
    this.isExpense = this.type === ECashType.expense;
    if (this.editItem) {
      this.cashForm.patchValue(this.editItem);
    }
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
        userId: this.config.currentUser.id
      };
      console.log(body);
      if (!this.editItem) {
        if (this.isExpense) {
          this.cashService.addExpense(body);
          this.dismissModal();
        } else {
          this.cashService.addIncome(body);
          this.dismissModal();
        }
      } else {
        this.cashService.updateItem(body, this.editItem.id);
        this.dismissModal();
      }
    }
  }

  public showDatePicker() {
    this.datePicker.present({
      date: new Date().toISOString(),
      theme: 'dark',
    }).then((result: any) => {
      console.log(result.value);
      // this.cashForm.controls.datetime.setValue(result.value.toISOString());
    }, err => {
      console.log(err);
    }).catch((err: any) => {
      console.log(err);
    });
  }

}
