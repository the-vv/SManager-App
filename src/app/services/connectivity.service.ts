import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Network } from '@capacitor/network';


@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {

  public appIsOnline: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isOnline = false;

  constructor() {
    this.initConnectivityMonitoring();
  }

  private async initConnectivityMonitoring() {
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
      this.isOnline = status.connected;
      this.appIsOnline.next(status.connected);
    });
    const { connected } = await Network.getStatus();
    this.isOnline = connected;
    this.appIsOnline.next(connected);
  }

}
