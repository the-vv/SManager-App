import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { ToastOptions } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  isLoading = false;
  loader: HTMLIonLoadingElement;
  constructor(
    public loadingController: LoadingController,
    public toastController: ToastController,
    public alertCtrl: AlertController
  ) { }

  async showSpinner() {
    this.isLoading = true;
    this.loader = await this.loadingController.create({
      cssClass: '',
      message: 'Please wait...',
    });
    await this.loader.present();
    if (!this.isLoading) {
      this.loader.dismiss();
    }
  }

  async hideSpinner() {
    this.isLoading = false;
    this.loadingController.dismiss();
  }

  public showDeleteConfrmation(item: string) {
    return new Promise<boolean>(async (resolve) => {
      const alert = await this.alertCtrl.create({
        cssClass: 'my-custom-class',
        header: 'Confirm!',
        message: `Are you sure want to delete '${item}'?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              resolve(false);
            }
          }, {
            text: 'Delete',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
      await alert.present();
      console.log('showDeleteConfrmation');
    });
  }

  async showToast(msg: string, duration: number = 3000, needDismiss: boolean = false) {
    const options: ToastOptions = {
      message: msg,
      duration
    };
    if (needDismiss) {
      options.buttons = [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ];
    }
    const toast = await this.toastController.create(options);
    toast.present();
  }
}
