import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ECashType, IIncomeExpense } from 'src/app/models/common';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { CreateSharedComponent } from '../create-shared/create-shared.component';

@Component({
  selector: 'app-income-expense-item',
  templateUrl: './income-expense-item.component.html',
  styleUrls: ['./income-expense-item.component.scss'],
})
export class IncomeExpenseItemComponent implements OnInit {

  @Input() item: IIncomeExpense;
  @Input() categoryName: string;
  public currentBankName: string;

  eCashType = ECashType;
  constructor(
    private common: CommonService,
    private firebase: FirebaseService,
    private modalController: ModalController,
    private alertCtrl: AlertController,
    private config: ConfigService
  ) { }

  ngOnInit() {
    this.currentBankName = this.config.currentUserAccounts.find(el => el.id === this.item.accountId)?.name;
  }

  async deleteItem() {
    if (await this.common.showDeleteConfirmation(this.item.title)) {
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

  showDetails() {
    this.alertCtrl.create({
      header: this.item.title,
      message: `<p class='text-${this.item.type === ECashType.expense ? 'danger' : 'success'} font-bold p-0 m-0 h5'>
        ${this.item.type.charAt(0).toUpperCase() + this.item.type.slice(1)}: ₹ ${this.item.amount}</p>
        <div class='mt-0.5 block'><strong class=''>Category: </strong> ${this.categoryName}</div>
        <div class='mt-0.5 block'><strong class=''>Date:</strong>
            ${new DatePipe('en').transform(this.item.datetime, 'dd/M/yyyy hh:mm a')}
          </div>
        <div class='mt-0.5 block'><strong class=''>Account:</strong> ${this.currentBankName}</div>
        <div class='mt-0.5 block'><strong class=''>Description: </strong> ${this.item.description}</div>
      `,
      buttons: [{ text: 'Close' }]
    }).then(alert => alert.present());
  }

}
