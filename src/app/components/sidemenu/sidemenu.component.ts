import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
})
export class SideMenuComponent implements OnInit {

  constructor(
    public user: UserService,
    public config: ConfigService
    ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
  }

  logout() {
    this.user.logout();
  }

}
