import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';
import { InvoiceService } from 'src/app/service/invoice-service/invoice.service';
import { LcService } from 'src/app/service/lc-service/lc.service';
import { BoeUploadService } from 'src/app/service/upload-service/BoE/boe-upload.service';
import { BolUploadService } from 'src/app/service/upload-service/BoL/bol-upload.service';

@Component({
  selector: 'app-upload-document',
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.less'],
})
export class UploadDocumentComponent {
  id_token = localStorage.getItem('id_token');
  formData_bill_of_exchange = new FormData();
  formData_bill_of_lading = new FormData();
  formData_invoice = new FormData();
  id_lc = '';
  bill_of_exchange: any;
  bill_of_lading: any;
  invoice: any;
  uploadProgress: number;
  uploadSub: Subscription;
  confirmModal?: NzModalRef;
  isFinish = false;
  lcDetail: any;

  constructor(
    private modal: NzModalService,
    private msg: NzMessageService,
    private route: ActivatedRoute,
    private bOLSer: BolUploadService,
    private bOESer: BoeUploadService,
    private invoiceSer: InvoiceService,
    private lcSer: LcService,
    private http: HttpClient // private sanitizer: DomSanitizer
  ) {}

  onFileSelectedBillOfExchange(event) {
    const file: File = event.target.files[0];
    if (file) {
      this.bill_of_exchange = file.name;
      this.formData_bill_of_exchange.append('bill_of_exchange', file);
      this.formData_bill_of_exchange.append('LCID', this.id_lc);
    }
  }

  onFileSelectedInvoice(event) {
    const file: File = event.target.files[0];
    if (file) {
      this.invoice = file.name;
      this.formData_invoice.append('invoice', file);
      this.formData_invoice.append('LCID', this.id_lc);
    }
  }

  onFileSelectedBillOfLading(event) {
    const file: File = event.target.files[0];
    if (file) {
      this.bill_of_lading = file.name;
      this.formData_bill_of_lading.append('bill_of_lading', file);
      this.formData_bill_of_lading.append('LCID', this.id_lc);
    }
  }

  getDetailLC(id: String) {
    this.lcSer.detail(id).subscribe((res) => {
      this.lcDetail = res;
      console.log(res);
      if (this.lcDetail.billOfLading) {
        this.bill_of_lading = this.lcDetail.billOfLading.file
          .split('\\')
          .pop()
          .split('/')
          .pop();
        console.log(this.bill_of_lading);
      }
      if (this.lcDetail.billOfExchange) {
        this.bill_of_exchange = this.lcDetail.billOfExchange.file
          .split('\\')
          .pop()
          .split('/')
          .pop();
      }
      if (this.lcDetail.invoice) {
        this.invoice = this.lcDetail.invoice.file
          .split('\\')
          .pop()
          .split('/')
          .pop();
      }
      this.changeStatusUpload();
    });
  }

  changeStatusUpload() {
    if (this.bill_of_exchange && this.bill_of_lading && this.invoice)
      this.isFinish = true;
  }

  uploadConfirm(): void {
    const filesNotUploaded: string[] = [];
    if (!this.bill_of_exchange) {
      filesNotUploaded.push('Bill of Exchange');
    }
    if (!this.bill_of_lading) {
      filesNotUploaded.push('Bill of Lading');
    }
    if (!this.invoice) {
      filesNotUploaded.push('Invoice');
    }
    const missingFiles = filesNotUploaded.join(', ');

    this.confirmModal = this.modal.confirm({
      nzTitle: 'Do you Want to accept this agreement?',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        if (this.bill_of_exchange) {
          this.bOESer
            .upload(this.formData_bill_of_exchange)
            .subscribe((res) => {
              this.msg.success(res.message);
            });
        }
        if (this.bill_of_lading) {
          this.bOLSer.upload(this.formData_bill_of_lading).subscribe((res) => {
            this.msg.success(res.message);
          });
        }
        if (this.invoice) {
          this.invoiceSer.create(this.formData_invoice).subscribe((res) => {
            this.msg.success(res.message);
          });
        }
        this.changeStatusUpload();
      },
    });
  }

  cancelUpload() {
    this.uploadSub.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
  }

  downloadFile() {
    // Make an HTTP request to the server endpoint that serves the file
    this.http;
    this.bOLSer.get(this.lcDetail.billOfLading.id).subscribe(
      (response: any) => {        
        var blob = new Blob([response], { type: 'application/pdf' });
        var url = window.URL.createObjectURL(blob);
        console.log(url);

        var a = document.createElement('a');
        a.href = url;
        a.download = '2022A_FE_PM_Answer.pdf';
        document.body.appendChild(a);
        console.log(a);
        a.click();

        window.URL.revokeObjectURL(url);

        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Failed to download the file: ' + error);
      }
    );
  }

  ngOnInit(): void {
    this.id_lc = this.route.snapshot.paramMap.get('id');
    this.getDetailLC(this.id_lc);
  }
}
