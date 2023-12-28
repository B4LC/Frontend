import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';
import { InvoiceService } from 'src/app/service/upload-service/invoice-service/invoice.service';
import { LcService } from 'src/app/service/lc-service/lc.service';
import { BoeUploadService } from 'src/app/service/upload-service/BoE/boe-upload.service';
import { BolUploadService } from 'src/app/service/upload-service/BoL/bol-upload.service';
import { UploadService } from 'src/app/service/upload-service/upload.service';

@Component({
  selector: 'app-upload-document',
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.less'],
})
export class UploadDocumentComponent implements OnInit {
  id_token = localStorage.getItem('id_token');
  formData = new FormData();
  formData_bill_of_exchange = new FormData();
  formData_bill_of_lading = new FormData();
  formData_invoice = new FormData();
  id_lc = '';
  bill_of_lading = {
    id: '',
    name: '',
    url: '',
    status: '',
  };
  bill_of_exchange = {
    id: '',
    name: '',
    url: '',
    status: '',
  };
  invoice = {
    id: '',
    name: '',
    url: '',
    status: '',
  };
  uploadProgress = 0;
  // uploadSub: Subscription;
  confirmModal?: NzModalRef;
  isFinish = false;
  lcDetail: any;
  bill_of_lading_new = false;
  bill_of_exchange_new = false;
  invoice_new = false;
  expandKeys = ['100', '1001'];
  value?: string;
  nodes = [
    {
      title: 'Invoice',
      key: 'invoice',
      children: [
        {
          title: 'invoice_1',
          key: 'invoice 1',
          isLeaf: true,
        },
      ],
    },
    {
      title: 'Bill of exchange',
      key: 'bill_of_exchange',
      children: [
        {
          title: 'BoE_1',
          key: 'bill_of_exchange 1',
          isLeaf: true,
          // children: [{ title: 'Type 1', key: '10020', isLeaf: true }]
        },
      ],
    },
  ];
  isLoadingCard: boolean = true;
  isDisplay: boolean = false;
  typeDocSelect: string = '';
  ocrDocument: any;
  invoiceForm: FormGroup;
  invoiceTableForm: FormGroup;
  tableHeaders: string[];
  tableData: any[];
  editId: any;
  isEditable: boolean = false;
  editingCell: { rowIndex: number; columnName: string } = null;
  formControls: { name: string; label: string }[];

  constructor(
    private fb: FormBuilder,
    private modal: NzModalService,
    private msg: NzMessageService,
    private route: ActivatedRoute,
    private bOLSer: BolUploadService,
    private bOESer: BoeUploadService,
    private invoiceSer: InvoiceService,
    private uploadSer: UploadService,
    private lcSer: LcService,
    private http: HttpClient // private sanitizer: DomSanitizer
  ) {}

  onChange($event: string): void {
    console.log(this.typeDocSelect);
  }

  onFileSelected(event) {
    this.isDisplay = true;
    const file: File = event.target.files[0];
    const typeDocMatch = this.typeDocSelect.split(' ');

    if (typeDocMatch && file) {
      const input = {
        doc_type: typeDocMatch[0],
        type: parseInt(typeDocMatch[1]),
        image_url: '',
      };

      console.log(input);
      this.formData.append('file', file);
      this.uploadSer.upload(this.formData).subscribe(
        (res) => {
          input.image_url = res;
          this.msg.success('Upload file success!');
          this.uploadSer.ocr_document(input).subscribe(
            (res2) => {
              console.log(res2);
              this.ocrDocument = res2.results;
              this.createFomatFormData(this.ocrDocument);
              if (this.ocrDocument.table) {
                this.createTableForm(this.ocrDocument.table);
              }
              console.log(this.ocrDocument);
            },
            (e) => {
              this.msg.error("Something's wrong!");
            }
          );
          console.log(input);
        },
        (e) => {
          this.msg.error("Something's wrong!");
        }
      );
    }
  }

  onFileSelectedBillOfExchange(event) {
    const file: File = event.target.files[0];
    if (file) {
      console.log(file);
      this.bill_of_exchange.name = file.name;
      this.formData_bill_of_exchange.append('bill_of_exchange', file);
      this.formData_bill_of_exchange.append('LCID', this.id_lc);
      console.log(this.formData_bill_of_exchange);
      this.bill_of_exchange_new = true;
    }
  }

  onFileSelectedInvoice(event) {
    const file: File = event.target.files[0];
    if (file) {
      this.invoice.name = file.name;
      this.formData_invoice.append('invoice', file);
      this.formData_invoice.append('LCID', this.id_lc);
      this.invoice_new = true;
    }
  }

  onFileSelectedBillOfLading(event) {
    const file: File = event.target.files[0];
    if (file) {
      this.bill_of_lading.name = file.name;
      this.formData_bill_of_lading.append('bill_of_lading', file);
      this.formData_bill_of_lading.append('LCID', this.id_lc);
      this.bill_of_lading_new = true;
    }
  }

  getDetailLC(id: String) {
    this.bill_of_lading_new = false;
    this.bill_of_exchange_new = false;
    this.invoice_new = false;

    console.log(this.formData_bill_of_exchange);

    this.lcSer.detail(id).subscribe((res) => {
      this.lcDetail = res;
      console.log(res);
      if (this.lcDetail.letterOfCredit.status == 'document_approved') {
        this.isFinish = true;
      }
      if (this.lcDetail.billOfLading.id) {
        this.bill_of_lading.id = this.lcDetail.billOfLading.id;
        this.bOLSer.get(this.bill_of_lading.id).subscribe((res) => {
          console.log(res);
          this.bill_of_lading.name = this.lcDetail.billOfLading.file
            .split('\\')
            .pop()
            .split('/')
            .pop();
          this.bill_of_lading.url = this.lcDetail.billOfLading.file;
          this.bill_of_lading.status = this.lcDetail.billOfLading.status;
        });
        console.log(this.bill_of_lading);
      }
      if (this.lcDetail.billOfExchange.id) {
        this.bill_of_exchange.id = this.lcDetail.billOfExchange.id;
        this.bOESer.get(this.bill_of_exchange.id).subscribe((res) => {
          console.log(res);
          this.bill_of_exchange.name = this.lcDetail.billOfExchange.file
            .split('\\')
            .pop()
            .split('/')
            .pop();
          this.bill_of_exchange.url = this.lcDetail.billOfExchange.file;
          this.bill_of_exchange.status = this.lcDetail.billOfExchange.status;
        });
      }
      if (this.lcDetail.invoice.id) {
        this.invoice.id = this.lcDetail.invoice.id;
        this.invoiceSer.get(this.invoice.id).subscribe((res) => {
          console.log(res);
          this.invoice.name = this.lcDetail.invoice.file
            .split('\\')
            .pop()
            .split('/')
            .pop();
          this.invoice.url = this.lcDetail.invoice.file;
          this.invoice.status = this.lcDetail.invoice.status;
        });
      }
    });
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
      nzTitle: 'Do you Want to upload these file?',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        if (this.bill_of_exchange_new) {
          this.bOESer.upload(this.formData_bill_of_exchange).subscribe(
            (res) => {
              console.log(res);
              this.msg.success(res.message);
            },
            (e) => {
              this.msg.error('Upload BILL OF EXCHANGE unsuccessfully');
              console.log(e);
            }
          );
        }
        if (this.bill_of_lading_new) {
          this.bOLSer.upload(this.formData_bill_of_lading).subscribe(
            (res) => {
              console.log(res);
              this.msg.success(res.message);
            },
            (e) => this.msg.error('Upload BILL OF LADING unsuccessfully')
          );
        }
        if (this.invoice_new) {
          this.invoiceSer.upload(this.formData_invoice).subscribe(
            (res) => {
              console.log(res);
              this.msg.success(res.message);
            },
            (e) => this.msg.error('Upload INVOICE unsuccessfully')
          );
        }
        this.getDetailLC(this.id_lc);
      },
    });
  }

  createFomatFormData(formData: any) {
    this.formControls = Object.keys(formData)
      .map((key) => {
        if (key !== 'table') {
          return { name: key, label: key.replace(/_/g, ' ').toUpperCase() };
        } else {
          return null; // Bỏ qua trường 'table'
        }
      })
      .filter((control) => control !== null);

    // Tạo form group và thêm controls vào nó
    const formGroupControls = {};
    this.formControls.forEach((control) => {
      formGroupControls[control.name] = new FormControl(formData[control.name]);
    });

    this.invoiceForm = this.fb.group(formGroupControls);
  }

  createTableForm(formData) {
    this.tableHeaders = Object.keys(formData);
    this.tableData = Object.keys(formData['0']).map((column) => {
      const rowData = {};
      this.tableHeaders.forEach((header, index) => {
        rowData[header] = formData[header][column];
      });
      return rowData;
    });

    this.invoiceTableForm = this.fb.group({
      table: this.fb.array([]),
    });

    const tableArray = this.invoiceTableForm.get('table') as FormArray;
    this.tableData.forEach((row) => {
      const formGroup = this.fb.group({});
      Object.keys(row).forEach((key, index) => {
        formGroup.addControl(key, new FormControl(row[key]));
      });
      tableArray.push(formGroup);
    });
  }

  getRowFormGroup(rowIndex: number): FormGroup {
    const tableArray = this.invoiceTableForm.get('table') as FormArray;
    return tableArray.at(rowIndex) as FormGroup;
  }

  getCellControl(rowIndex: number, columnName: string): FormControl {
    const rowFormGroup = this.getRowFormGroup(rowIndex);
    return rowFormGroup.get(columnName) as FormControl;
  }

  startEdit(rowIndex: number, columnName: string) {
    this.editingCell = { rowIndex, columnName };
    this.getCellControl(rowIndex, columnName).enable();
  }

  stopEdit() {
    this.editingCell = null;
  }

  requestEdit() {
    this.isEditable = true;
  }

  onSubmit() {
    console.log('this.invoiceTableForm.value', this.invoiceTableForm.value);
    console.log('this.invoiceForm.value', this.invoiceForm.value);
    this.isEditable = false;

    // Get the data in the original format
    const originalFormatData = this.getFormattedData();
    console.log(originalFormatData);
  }

  getFormattedData(): any {
    const formattedData = {};

    this.tableHeaders.forEach((header, i) => {
      formattedData[header] = {};
      this.tableData.forEach((data, j) => {
        formattedData[header][j.toString()] = this.getCellControl(
          j,
          header
        ).value;
      });
    });

    return formattedData;
  }

  saveDocument() {
    const data = { ...this.invoiceForm, ...this.invoiceTableForm };
  }

  ngOnInit(): void {
    this.id_lc = this.route.snapshot.paramMap.get('id');
    this.getDetailLC(this.id_lc);
  }
}
