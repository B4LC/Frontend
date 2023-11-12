import { Component } from '@angular/core';
import { t } from 'chart.js/dist/chunks/helpers.core';
import { UserService } from 'src/app/service/user-service/user.service';
import {
  NonNullableFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.less'],
})
export class ProfileComponent {
  userInfo = {
    username: '',
    email: '',
  };

  role = localStorage.getItem('role');
  username = localStorage.getItem('username');
  isLoadingPage = true;
  isEditing = false;
  validateForm!: UntypedFormGroup;

  constructor(
    private userSer: UserService,
    private fb: NonNullableFormBuilder,
    private msg: NzMessageService
  ) {
    this.validateForm = this.fb.group({
      username: [this.userInfo.username, [Validators.required]],
      email: [this.userInfo.email, [Validators.required]],
    });
  }

  getUserInfo() {
    this.userSer.getInfo().subscribe(
      (res) => {
        console.log(res);
        this.userInfo.username = res.username;
        this.userInfo.email = res.email;
        this.isLoadingPage = false;
      },
      (e) => this.msg.error('Something is wrong!')
    );
  }

  edit() {
    this.isEditing = true;
  }

  save() {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
      this.userSer.updateInfo(this.validateForm.value).subscribe(
        (res) => {
          this.msg.success('Change infomation successfully');
          this.isEditing = false;
        },
        (e) => this.msg.error('Change infomation unsuccessfully')
      );
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  ngOnInit(): void {
    this.getUserInfo();
  }
}