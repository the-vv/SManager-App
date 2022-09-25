import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription, tap } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { ConnectivityService } from 'src/app/services/connectivity.service';

@Component({
  selector: 'app-cloud-sync',
  templateUrl: './cloud-sync.component.html',
  styleUrls: ['./cloud-sync.component.scss'],
})
export class CloudSyncComponent implements OnInit, OnDestroy {

  @Input()
  popMode = false;

  syncDone = true;
  offline = false;

  subscription: Subscription;

  private onceOffline = false;

  constructor(
    public popoverController: PopoverController,
    public connection: ConnectivityService,
    private zone: NgZone,
    private config: ConfigService,
    private common: CommonService
  ) {
    this.connection.appIsOnline
      .pipe(tap(res => {
        if (this.onceOffline && res) {
          this.common.showToast('You are online');
        } else if (!res) {
          this.common.showToast('You are offline');
          this.onceOffline = true;
        }
      }))
      .subscribe(res => {
        this.zone.run(() => {
          this.offline = !res;
        });
      });
  }

  ngOnInit() {
    this.config.cloudSyncing.subscribe(res => {
      this.zone.run(() => {
        this.syncDone = !res;
      });
    });
  }

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

  ionViewWillEnter() {
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
