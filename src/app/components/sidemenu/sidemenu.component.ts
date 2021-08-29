import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent implements OnInit {

  constructor(
    public user: UserService
    ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
  }

  logout() {
    this.user.logout();
  }

}
