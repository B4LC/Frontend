import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
})
export class LoginComponent implements OnInit {
  validateFormLogin!: UntypedFormGroup;
  requestLoginForm = {
    email: String,
    password: String,
  };
  isLoginFailed: boolean;
  isLoading = false;

  constructor(
    private fb: UntypedFormBuilder,
    private loginService: AuthenticationService,
    public router: Router,
    private msg: NzMessageService
  ) {}

  submitForm(): void {
    this.isLoading = true;
    if (this.validateFormLogin.valid) {
      console.log('submit', this.validateFormLogin.value);
      this.requestLoginForm.email = this.validateFormLogin.value.username;
      this.requestLoginForm.password = this.validateFormLogin.value.password;
      console.log(this.requestLoginForm);

      this.loginService.login(this.requestLoginForm).subscribe(
        (res) => {
          console.log(res);
          this.msg.success('Login successfully!');
          this.isLoading = false;
          if (localStorage.getItem('role') == 'user') {
            this.router.navigateByUrl('/');
          } else this.router.navigateByUrl('/agreements');
        },
        (error) => {
          console.error('Login failed:', error);
          this.msg.error('Login failed!')
          this.isLoginFailed = true;
          this.isLoading = false;
          // Xử lý lỗi nếu cần thiết
        }
      );
    } else {
      Object.values(this.validateFormLogin.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  ngOnInit(): void {
    this.validateFormLogin = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: true,
    });
  }
}
