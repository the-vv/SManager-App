import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  isLoading = false;
  loader: HTMLIonLoadingElement;
  constructor(
    public loadingController: LoadingController) { }

  async showSpinner() {
    this.isLoading = true;
    this.loader = await this.loadingController.create({
      cssClass: '',
      message: 'Please wait...'
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
}
