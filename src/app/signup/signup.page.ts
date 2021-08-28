import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  showPassword = false;
  signupForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    cpassword: ['', this.confirmPassword()]
  });;
  constructor(
    private formBuilder: FormBuilder,
    public user: UserService
  ) { }

  ngOnInit() {
  }
  onSignup() {
    console.log(this.signupForm);
    if (this.signupForm.valid) {
      this.user.signup(this.signupForm.value)
      ;
    }
  }
  get f() {
    return this.signupForm?.controls;
  }
  confirmPassword(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null =>
      control.value === this.f?.password.value ? null : { confirm: true };
  }
}
