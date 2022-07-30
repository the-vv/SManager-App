import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ECashType } from 'src/app/models/common';
import { CreateSharedComponent } from '../create-shared/create-shared.component';

@Component({
  selector: 'app-fab',
  templateUrl: './fab.component.html',
  styleUrls: ['./fab.component.scss'],
})
export class FabComponent implements OnInit {

  isOverViewPage = false;

  constructor(
    public modalController: ModalController,
    private router: Router
  ) { }


  ngOnInit() {
    if (this.router.url.includes('overview')) {
      this.isOverViewPage = true;
    }
  }

  async createExpense() {
    const modal = await this.modalController.create({
      component: CreateSharedComponent,
      cssClass: '',
      componentProps: {
        type: ECashType.expense
      }
    });
    return await modal.present();
  }
  async createIncome() {
    const modal = await this.modalController.create({
      component: CreateSharedComponent,
      cssClass: '',
      componentProps: {
        type: ECashType.income
      }
    });
    return await modal.present();
  }

  onAdd() {
    if(this.isOverViewPage) {
      return;
    }
    if (this.router.url.includes('expense')) {
      this.createExpense();
    }
    if (this.router.url.includes('income')) {
      this.createIncome();
    }
  }

}
