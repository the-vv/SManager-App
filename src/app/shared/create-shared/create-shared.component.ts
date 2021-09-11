import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CashType } from 'src/app/models/common';
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
    private formBuilder: FormBuilder
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
    console.log(this.cashForm.value);
  }
}
