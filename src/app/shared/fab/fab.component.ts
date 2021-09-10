import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CashType } from 'src/app/models/common';
import { CreateSharedComponent } from '../create-shared/create-shared.component';

@Component({
  selector: 'app-fab',
  templateUrl: './fab.component.html',
  styleUrls: ['./fab.component.scss'],
})
export class FabComponent implements OnInit {

  constructor(
    public modalController: ModalController
  ) { }

  ngOnInit() {}

  async createExpense() {
    const modal = await this.modalController.create({
      component: CreateSharedComponent,
      cssClass: '',
      componentProps: {
        type: CashType.expense
      }
    });
    return await modal.present();
  }
  async createIncome() {
    const modal = await this.modalController.create({
      component: CreateSharedComponent,
      cssClass: '',
      componentProps: {
        type: CashType.income
      }
    });
    return await modal.present();
  }

}
