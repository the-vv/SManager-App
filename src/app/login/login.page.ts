import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  isLoading = false;
  errorMessages = '';
  loader: HTMLIonLoadingElement;
  showPassword = false;
  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  constructor(
    private formBuilder: FormBuilder,
    public user: UserService,
    private router: Router,
    private common: CommonService
  ) { }

  ngOnInit() {
  }
  onLogin() {
    if (this.loginForm.valid) {
      this.common.showSpinner();
      this.user.login(this.loginForm.value)
        .subscribe(res => {
          this.common.hideSpinner();
          if (res) {
            this.router.navigate(['home'], { replaceUrl: true });
          }
        }, err => {
          this.errorMessages = err.error.status;
          this.common.hideSpinner();
        });
    }
  }
  get f() {
    return this.loginForm?.controls;
  }

}
