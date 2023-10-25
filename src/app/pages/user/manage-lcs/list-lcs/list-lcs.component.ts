import { Component } from '@angular/core';
import { LcService } from 'src/app/service/lc-service/lc.service';

@Component({
  selector: 'app-list-lcs',
  templateUrl: './list-lcs.component.html',
  styleUrls: ['./list-lcs.component.less']
})
export class ListLCsComponent {
  listOfData = []

  constructor(private lcSer: LcService) {}

  getList() {
    this.lcSer.list().subscribe((res) => {
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
