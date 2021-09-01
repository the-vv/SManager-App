import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

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

  constructor(
    public popoverController: PopoverController
  ) { }

  ngOnInit() {}

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

}
