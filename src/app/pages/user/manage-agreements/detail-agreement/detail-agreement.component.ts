import { Component } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AgreementService } from 'src/app/service/agreement-service/agreement.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail-agreement',
  templateUrl: './detail-agreement.component.html',
  styleUrls: ['./detail-agreement.component.less'],
})
export class DetailAgreementComponent {
  requestForm = {
    status: 'eyo',
    name: 'demo',
    agreementID: 'demo',
    applicant: 'demo',
    applicantLegalName: 'demo',
    beneficiary: 'demo',
    issuingBank: 'demo',
    issuingBankCode: 'demo',
    advisingBank: 'demo',
    advisingBankCode: 'demo',
    beneficiaryLegalName: 'demo',
    commodityName: 'demo',
    commodityValue: 'demo',
    paymentMethod: 'demo',
    additionalInformation: 'demo',
    date: 'demo',
  };
  confirmModal?: NzModalRef;
  isVisible = false;
  validateForm: FormGroup<{
    reason: FormControl<string>;
  }>;

  constructor(
    private modal: NzModalService,
    private fb: NonNullableFormBuilder,
    private agreementSer: AgreementService,
    private route: ActivatedRoute
  ) {
    this.validateForm = this.fb.group({
      reason: ['', [Validators.required]],
    });
  }

  showConfirm(): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: 'Do you Want to accept this agreement?',
      nzContent:
        'When clicked the OK button, this dialog will be closed after 1 second',
      nzCancelText: 'Cancel',
      nzOnOk: () =>
        new Promise((resolve, reject) => {
          setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!')),
    });
  }

  showModalRefuse(): void {
    this.isVisible = true;
  }

  handleOkRefuse(): void {
    console.log('Button ok clicked!');
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
      this.isVisible = false;
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleCancelRefuse(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }
  
  salescontract_id: string;
  getDetail() {
    this.salescontract_id = this.route.snapshot.paramMap.get('id');
    this.agreementSer.detail(this.salescontract_id).subscribe((res) => {
      this.requestForm.advisingBank = res.advisingBank;
      this.requestForm.date = res.deadlineInDate;
      this.requestForm.applicant = res.importer;
      this.requestForm.beneficiary = res.exporter;
      this.requestForm.commodityValue = res.price;
      this.requestForm.commodityName = res.commodity;
      this.requestForm.issuingBank = res.issuingBank;
      this.requestForm.paymentMethod = res.paymentMethod
      this.requestForm.status = res.status;
      console.log(res);
    })
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getDetail();
  }
}
