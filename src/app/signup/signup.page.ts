import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  errorMessages = '';
  loader: HTMLIonLoadingElement;
  showPassword = false;
  signupForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    cpassword: ['', this.confirmPassword()]
  });;
  constructor(
    private formBuilder: FormBuilder,
    public user: UserService,
    private router: Router,
    private common: CommonService
  ) { }

  ngOnInit() {
    // GoogleAuth.init();
  }
  onSignup() {
    console.log(this.signupForm);
    this.common.showSpinner();
    if (this.signupForm.valid) {
      this.user.signup(this.signupForm.value).subscribe(res => {
        console.log('signed up');
        this.common.hideSpinner();
        if (res) {
          this.router.navigate(['home'], { replaceUrl: true });
        }
      }, err => {
        this.common.hideSpinner();
        this.errorMessages = err.error.status;
      });
    }
  }
  get f() {
    return this.signupForm?.controls;
  }
  confirmPassword(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null =>
      control.value === this.f?.password.value ? null : { confirm: true };
  }
  async gLogin() {
    const user = await GoogleAuth.signIn();
    console.log(user);
  }
}
