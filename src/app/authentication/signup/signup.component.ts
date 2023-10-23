import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NzFormTooltipIcon } from 'ng-zorro-antd/form';
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import {Router} from '@angular/router';
import getContract from 'src/helper/contract';
import { ethers } from 'ethers';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.less'],
})
export class SignupComponent implements OnInit {
  validateForm!: UntypedFormGroup;
  requestRegisterForm = {
    contractId: '',
    username: String,
    email: String,
    password: String,
    role: String,
  };
  captchaTooltipIcon: NzFormTooltipIcon = {
    type: 'info-circle',
    theme: 'twotone',
  };

  constructor(
    private fb: UntypedFormBuilder,
    private registerService: AuthenticationService,
    private mess: NzMessageService,
    private router: Router
  ) {}

  async submitForm(): Promise<void> {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
      if(this.requestRegisterForm.role.toString() == "bank") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const contract = getContract();
        const bankAddress = signer.getAddress();
        await contract.addBank(this.requestRegisterForm.username, bankAddress);
        
        // this.requestRegisterForm.contractId = parseInt(bankID.value._hex, 16);
        contract.on("BankAdded", (result) => {
          // const res = new String(parseInt(result._hex, 16).toString())
          this.validateForm.value.contractId = parseInt(result._hex, 16).toString();
          console.log(this.validateForm.value.contractId);
          
        })
      }
      this.requestRegisterForm.username = this.validateForm.value.nickname;
      this.requestRegisterForm.email = this.validateForm.value.email;
      this.requestRegisterForm.password = this.validateForm.value.password;
      this.requestRegisterForm.role = this.validateForm.value.role;
      this.requestRegisterForm.contractId = this.validateForm.value.contractId;
      console.log(this.requestRegisterForm);
      if(this.requestRegisterForm.contractId != "") {
        this.registerService
          .register(this.requestRegisterForm)
          .subscribe((res) => {
            if (res.message == 'Register successfully') {
              this.mess.success('Register successfully!');
              this.router.navigate(['/auth/login']);
            } else this.mess.error('Register unsuccessfully!');
          });
      } 
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() =>
      this.validateForm.controls['checkPassword'].updateValueAndValidity()
    );
  }

  confirmationValidator = (
    control: UntypedFormControl
  ): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls['password'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  getCaptcha(e: MouseEvent): void {
    e.preventDefault();
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      contractId: '',
      email: [null, [Validators.email, Validators.required]],
      password: [null, [Validators.required]],
      checkPassword: [null, [Validators.required, this.confirmationValidator]],
      nickname: [null, [Validators.required]],
      role: [null, [Validators.required]],
      agree: [false],
    });
  }
}
