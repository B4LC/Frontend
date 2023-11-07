import { Component, ElementRef } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { InvoiceService } from 'src/app/service/upload-service/invoice-service/invoice.service';
import { LcService } from 'src/app/service/lc-service/lc.service';
import { BoeUploadService } from 'src/app/service/upload-service/BoE/boe-upload.service';
import { BolUploadService } from 'src/app/service/upload-service/BoL/bol-upload.service';

@Component({
  selector: 'app-detail-lc',
  templateUrl: './detail-lc.component.html',
  styleUrls: ['./detail-lc.component.less'],
})
export class DetailLcComponent {
  username = localStorage.getItem('username');
  role = localStorage.getItem('role');
  lcDetail: any;
  lc_id = '';
  isVisible = false;
  validateRefuseForm!: UntypedFormGroup;
  confirmModal?: NzModalRef;
  progress: number;
  bill_of_exchange: any;
  bill_of_lading: any;
  invoice: any;
  isAllApprove = false;
  eventContract = {
    LcCreatedEvent: '',
    LcApprovedEvent: '',
    docUploadedEvent: '',
    LcRejectedEvent: '',
    LcStatusChangedEvent: ''
  };
  isLoadingPage = true;

  constructor(
    private lcSer: LcService,
    private msg: NzMessageService,
    private route: ActivatedRoute,
    private el: ElementRef,
    private fb: UntypedFormBuilder,
    private modal: NzModalService,
    private bOLSer: BolUploadService,
    private bOESer: BoeUploadService,
    private invoiceSer: InvoiceService
  ) {
    this.validateRefuseForm = this.fb.group({
      reason: ['', [Validators.required]],
    });
  }

  scrollToTarget(position: String) {
    const targetElement = this.el.nativeElement.querySelector('#' + position);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getFileName(name: String): String {
    if (name) {
      return name.split('\\').pop().split('/').pop();
    }
    return null;
  }

  getDetailLC() {
    this.lc_id = this.route.snapshot.paramMap.get('id');
    this.lcSer.detail(this.lc_id).subscribe((res) => {
      console.log(res);
      this.lcDetail = res;
      if (this.lcDetail.letterOfCredit.status == 'created') this.progress = 1;
      else if (this.lcDetail.letterOfCredit.status == 'advising_bank_approved')
        this.progress = 2;
      else if (
        this.lcDetail.letterOfCredit.status == 'Buyer/Seller upload document'
      )
        this.progress = 3;
      else if (this.lcDetail.letterOfCredit.status == 'advising_bank_rejected')
        this.progress = 5;
      else if (this.lcDetail.letterOfCredit.status == 'document_approved')
        this.progress = 4;
      else this.progress = 6;

      if (this.lcDetail.billOfLading) {
        this.bill_of_lading = this.lcDetail.billOfLading;
        console.log(this.bill_of_lading);
      }
      if (this.lcDetail.billOfExchange) {
        this.bill_of_exchange = this.lcDetail.billOfExchange;
      }
      if (this.lcDetail.invoice) {
        this.invoice = this.lcDetail.invoice;
      }

      if (
        this.bill_of_exchange.status == 'approved' &&
        this.bill_of_lading.status == 'approved' &&
        this.invoice.status == 'approved' &&
        this.role == 'bank'
      ) {
        this.isAllApprove = true;
      }
      this.isLoadingPage = false
    }, (e) => {this.msg.error('Something is wrong!')});
  }

  updateStatus() {
    if (this.isAllApprove) {
      const body = {
        status: 'document_approved',
      };
      this.lcSer.updateStatus(this.lc_id, body).subscribe((res) => {
        this.msg.success('Update Success');
        this.getDetailLC();
      });
    }
  }

  approveLC(): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: 'Do you Want to approve this LC?',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.lcSer.approve(this.lc_id, {}).subscribe((res) => {
          console.log(res);
          this.msg.success(res.message);
          this.getDetailLC();
        });
      },
    });
  }

  showModalRefuse(): void {
    this.isVisible = true;
  }

  handleOkRefuse(): void {
    if (this.validateRefuseForm.valid) {
      this.lcSer
        .return(this.lc_id, this.validateRefuseForm.value)
        .subscribe((res) => {
          console.log(res);
          this.msg.success(res.message);
          this.getDetailLC();
        });
      this.isVisible = false;
    } else {
      Object.values(this.validateRefuseForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleCancelRefuse(): void {
    this.isVisible = false;
  }

  cancel(): void {
    // this.msg.info('click cancel');
  }

  acceptDocumentINVOICE(): void {
    this.invoiceSer.approve(this.lc_id, {}).subscribe((res) => {
      this.msg.success(res.message);
      this.getDetailLC();
    }, (e) => this.msg.error('Something is wrong!'));
  }

  rejectDocumentINVOICE(): void {
    this.invoiceSer.reject(this.lc_id, {}).subscribe((res) => {
      this.msg.success(res.message);
      this.getDetailLC();
    }, (e) => this.msg.error('Something is wrong!'));
  }

  acceptDocumentBOL(): void {
    this.bOLSer.approve(this.lc_id, {}).subscribe((res) => {
      this.msg.success(res.message);
      this.getDetailLC();
    }, (e) => this.msg.error('Something is wrong!'));
  }

  rejectDocumentBOL(): void {
    this.bOLSer.reject(this.lc_id, {}).subscribe((res) => {
      this.msg.success(res.message);
      this.getDetailLC();
    }, (e) => this.msg.error('Something is wrong!'));
  }

  acceptDocumentBOE(): void {
    this.bOESer.approve(this.lc_id, {}).subscribe((res) => {
      this.msg.success(res.message);
      this.getDetailLC();
    }, (e) => this.msg.error('Something is wrong!'));
  }

  rejectDocumentBOE(): void {
    this.bOESer.reject(this.lc_id, {}).subscribe((res) => {
      this.msg.success(res.message);
      this.getDetailLC();
    }, (e) => this.msg.error('Something is wrong!'));
  }

  getEventContract() {
    this.lcSer.getContractEvent(this.lc_id).subscribe(
      (res) => {
        console.log(res);
        this.eventContract.LcApprovedEvent = res.LcApprovedEvent.length>0?res.LcApprovedEvent[0].transactionHash:null;
        this.eventContract.LcCreatedEvent = res.LcCreatedEvent.length>0?res.LcCreatedEvent[0].transactionHash:null;
        this.eventContract.LcRejectedEvent = res.LcRejectedEvent.length>0?res.LcRejectedEvent[0].transactionHash:null;
        this.eventContract.LcStatusChangedEvent = res.LcStatusChangedEvent.length>0?res.LcStatusChangedEvent[0].transactionHash:null;
        this.eventContract.docUploadedEvent = res.docUploadedEvent.length>0?res.docUploadedEvent[0].transactionHash:null;
        console.log(this.eventContract)
      },
      (e) => {
        this.msg.error('Something is wrong!');
      }
    );
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getDetailLC();
    this.getEventContract();
  }
}
