import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { CashService } from 'src/app/services/cash.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-month-choose',
  templateUrl: './month-choose.component.html',
  styleUrls: ['./month-choose.component.scss'],
})
export class MonthChooseComponent implements OnInit {

  @Input() popMode = false;
  maxDate = new Date().toISOString();
  selection: string =  new Date().toISOString();
  open = false;

  constructor(
    private cashService: CashService,
    private popoverController: PopoverController,
    private common: CommonService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.selection = this.common.toLocaleIsoDateString(new Date(
      Date.parse(`${this.cashService.currentMonthData.month} 1, ${this.cashService.currentMonthData.year}`)
    ));
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: MonthChooseComponent,
      event: ev,
      translucent: true,
      componentProps: {
        popMode: true
      }
    });
    return await popover.present();
  }

  onChange(date: any) {
    this.cashService.setup(new Date(date));
  }

}
