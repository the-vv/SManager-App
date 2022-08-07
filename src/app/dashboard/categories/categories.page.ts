import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ICategory } from 'src/app/models/common';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  public allCategories: ICategory[] = [];
  public subs: Subscription;

  constructor(
    private alertController: AlertController,
    private firebase: FirebaseService,
    private common: CommonService,
    private config: ConfigService
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    if (this.subs) {
      this.subs.unsubscribe();
    }
    this.subs = this.firebase.getAllUserCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories;
        console.log(categories);
      },
      error: err => {
        console.log(err);
      }
    });
  }

  ionViewDidLeave() {
  }

  async onAddCategory() {
    const alert = await this.alertController.create({
      header: 'Please enter your category info',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Create',
          role: 'create',
        }
      ],
      inputs: [
        {
          placeholder: 'Category Name',
          label: 'Category Name',
          attributes: {
            autocapitalize: true,
          }
        }
      ],
    });
    await alert.present();
    alert.onDidDismiss().then((value) => {
      const catName = value?.data?.values?.[0];
      if (catName && value?.role === 'create') {
        this.firebase.createCategpry({
          name: catName,
          userId: this.config.currentUser.id,
        })
          .then(() => {
            this.common.showToast('Category created successfully');
          }).catch(err => {
            console.log(err);
            this.common.showToast('Error creating category');
          });
      }
    });
  }

}
