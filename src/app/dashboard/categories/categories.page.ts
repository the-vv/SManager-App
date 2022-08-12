import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ICategory } from 'src/app/models/common';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { StorageService } from 'src/app/services/storage.service';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const Coloris: any;

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
    private config: ConfigService,
    private storage: StorageService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
    this.subs = this.firebase.getAllUserCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories;
      },
      error: err => {
        console.log(err);
      }
    });
    this.storage.setLastPage(this.router.url.slice(this.router.url.lastIndexOf('/') + 1));
    Coloris({
      el: '.coloris-picker',
      theme: 'dark'
    });
  }

  onColorChange(color: string, category: ICategory) {
    category.color = color;
    this.common.showSpinner();
    this.firebase.updateCategory(category, category.id)
      .then(() => {
        this.common.showToast('Category color updated successfully');
      }).catch(err => {
        console.log(err);
        this.common.showToast('Error updating category color');
      })
      .finally(() => {
        this.common.hideSpinner();
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
        this.config.cloudSyncing.next(true);
        const oldCategoriesLength = this.allCategories.length;
        this.firebase.createCategpry({
          name: catName,
          userId: this.config.currentUser.id,
          color: this.getRandomColor()
        })
          .then(() => {
            this.config.cloudSyncing.next(false);
            this.common.showToast('Category created successfully');
            if (oldCategoriesLength === 0) {
              this.alertController.create({
                header: 'Change category color',
                message: 'You can change category color by tapping on the color picker',
                buttons: [
                  {
                    text: 'OK',
                    role: 'cancel'
                  }
                ]
              }).then(message => {
                message.present();
              });
            }
            // show a meesage
          }).catch(err => {
            this.config.cloudSyncing.next(false);
            console.log(err);
            this.common.showToast('Error creating category');
          });
      }
    });
  }

  async onDeleteCategory(category: ICategory) {
    if (await this.common.showDeleteConfrmation(category.name)) {
      this.common.showSpinner();
      this.firebase.deleteCategory(category.id)
        .then(() => {
          this.common.hideSpinner();
          this.common.showToast('Category deleted successfully');
        }).catch(err => {
          this.common.hideSpinner();
          console.log(err);
          this.common.showToast('Error deleting category');
        }
        );
    }
  }

  async onEditCategory(category: ICategory) {
    const alert = await this.alertController.create({
      header: 'Please enter your category info',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Update',
          role: 'update',
        }
      ],
      inputs: [
        {
          placeholder: 'Category Name',
          label: 'Category Name',
          value: category.name,
          attributes: {
            autocapitalize: true,
          }
        }
      ],
    });
    await alert.present();
    alert.onDidDismiss().then((value) => {
      const catName = value?.data?.values?.[0];
      if (catName && value?.role === 'update') {
        this.config.cloudSyncing.next(true);
        category.name = catName;
        this.firebase.updateCategory(category, category.id)
          .then(() => {
            this.config.cloudSyncing.next(false);
            this.common.showToast('Category updated successfully');
          }).catch(err => {
            this.config.cloudSyncing.next(false);
            console.log(err);
            this.common.showToast('Error updating category');
          }
          );
      }
    });
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }



}
