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

  async showSpinner(message = 'Please wait...') {
    this.isLoading = true;
    this.loader = await this.loadingController.create({
      cssClass: '',
      message,
    });
    await this.loader.present();
    if (!this.isLoading) {
      this.loader.dismiss();
    }
    return;
  }

  async hideSpinner() {
    try {
      this.isLoading = false;
      this.loadingController.dismiss().catch(() => { });
    } catch (error) {
      console.log(error);
    }
  }

  public showDeleteConfirmation(item: string, itemType?: string) {
    return new Promise<boolean>(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: 'Confirm!',
        message: `Are you sure want to delete${itemType ? ' ' + itemType : ''} '${item}'?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              resolve(false);
            }
          }, {
            text: 'Delete',
            role: 'destructive',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
      await alert.present();
      // console.log('showDeleteConfirmation');
    });
  }


  async showToast(msg: string, duration: number = 2500, showDismiss: boolean = true) {
    const toast = await this.toastController.create({
      message: msg,
      duration,
      buttons: showDismiss ? [{
        text: 'Dismiss',
        role: 'cancel'
      }] : [],
      position: 'bottom',
    });
    toast.present();
  }

  toLocaleIsoDateString(date: Date) {
    const tzo = -date.getTimezoneOffset();
    const dif = tzo >= 0 ? '+' : '-';
    const pad = (num: any) => ((num < 10 ? '0' : '') + num);
    return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      dif + pad(Math.floor(Math.abs(tzo) / 60)) +
      ':' + pad(Math.abs(tzo) % 60);
  }
}
