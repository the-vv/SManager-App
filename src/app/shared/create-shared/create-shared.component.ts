import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CashType, IncomeExpense } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-create-shared',
  templateUrl: './create-shared.component.html',
  styleUrls: ['./create-shared.component.scss'],
})
export class CreateSharedComponent implements OnInit {

  @Input() public type: CashType;

  isExpense: boolean;

  public cashForm: FormGroup;

  constructor(
    public modalController: ModalController,
    private formBuilder: FormBuilder,
    public cashService: CashService
  ) {
    this.cashForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      amount: ['', Validators.required],
      datetime: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isExpense = this.type === CashType.expense;
  }

  get f() {
    return this.cashForm.controls;
  }

  dismissModal() {
    this.modalController.dismiss({
      dismisse: true
    });
  }

  onCreate() {
    if (this.cashForm.valid) {
      const body: IncomeExpense = {
        _id: uuidv4(),
        title: this.cashForm.value.title,
        description: this.cashForm.value.description,
        datetime: this.cashForm.value.datetime,
        amount: this.cashForm.value.amount,
        type: this.isExpense ? CashType.expense : CashType.income,
        synced: false
      };
      console.log(body);
      if (this.isExpense) {
        this.cashService.addExpense(body);
        this.dismissModal();
      } else  {
        this.cashService.addIncome(body);
        this.dismissModal();
      }
    }
  }

}
