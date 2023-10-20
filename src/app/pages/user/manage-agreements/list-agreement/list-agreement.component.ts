import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AgreementService } from 'src/app/service/agreement-service/agreement.service';

@Component({
  selector: 'app-list-agreement',
  templateUrl: './list-agreement.component.html',
  styleUrls: ['./list-agreement.component.less']
})
export class ListAgreementComponent {
  listOfData = [];

  constructor(private route: ActivatedRoute, private agreementSer: AgreementService) {}

  detail(id: number) {
    this.route.params.subscribe(params => {
      const id = params['id'];
    });
  }

  getList() {
    this.agreementSer.list().subscribe((res) => {
      console.log(res);
      this.listOfData = res;
    })
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getList();
  }
}
