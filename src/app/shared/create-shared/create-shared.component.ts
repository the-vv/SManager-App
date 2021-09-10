import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CashType } from 'src/app/models/common';
@Component({
  selector: 'app-create-shared',
  templateUrl: './create-shared.component.html',
  styleUrls: ['./create-shared.component.scss'],
})
export class CreateSharedComponent implements OnInit {

  @Input() type: CashType;

  constructor(
    public modalController: ModalController
  ) { }

  ngOnInit() {}

  dismissModal() {
    this.modalController.dismiss({
      dismisse: true
    });
  }
}
