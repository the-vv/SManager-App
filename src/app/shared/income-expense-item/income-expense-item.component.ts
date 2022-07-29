import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ECashType, IIncomeExpense } from 'src/app/models/common';
import { CommonService } from 'src/app/services/common.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { CreateSharedComponent } from '../create-shared/create-shared.component';

@Component({
  selector: 'app-income-expense-item',
  templateUrl: './income-expense-item.component.html',
  styleUrls: ['./income-expense-item.component.scss'],
})
export class IncomeExpenseItemComponent implements OnInit {

  @Input() item: IIncomeExpense;
  eCashType = ECashType;
  constructor(
    private common: CommonService,
    private firebase: FirebaseService,
    private modalController: ModalController
  ) { }

  ngOnInit() { }

  async deleteItem() {
    if (await this.common.showDeleteConfrmation(this.item.title)) {
      this.firebase.deleteIncomeExpense(this.item.id).then((r) => {
        this.common.showToast(`${this.item.type.charAt(0).toUpperCase() + this.item.type.slice(1)} Deleted successfully`);
      })
      .catch(err => {
        console.log(err);
      });
    }
  }

  async editIncomeExpense() {
    const modal = await this.modalController.create({
      component: CreateSharedComponent,
      cssClass: '',
      componentProps: {
        editItem: this.item
      }
    });
    return await modal.present();
  }

}
