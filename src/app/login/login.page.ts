import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  showPassword = false;
  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  constructor(
    private formBuilder: FormBuilder,
    public user: UserService
  ) { }

  ngOnInit() {
  }
  onLogin() {
    console.log(this.loginForm);
    if (this.loginForm.valid) {
      this.user.signup(this.loginForm.value);
    }
  }
  get f() {
    return this.loginForm?.controls;
  }

}
