import { Component, Input, NgZone, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ConnectivityService } from 'src/app/services/connectivity.service';

@Component({
  selector: 'app-cloud-sync',
  templateUrl: './cloud-sync.component.html',
  styleUrls: ['./cloud-sync.component.scss'],
})
export class CloudSyncComponent implements OnInit {

  @Input()
  popMode = false;

  syncDone = true;
  offline = false;

  subscription: Subscription;

  constructor(
    public popoverController: PopoverController,
    public connection: ConnectivityService,
    private zone: NgZone
  ) {
    this.connection.appIsOnline.subscribe(res => {
      this.zone.run(() => {
        this.offline = !res;
      });
    });
  }

  ngOnInit() { }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: CloudSyncComponent,
      event: ev,
      translucent: true,
      componentProps: {
        popMode: true
      }
    });
    return await popover.present();
  }

  ionViewWillLeave() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
