import { Component, Input, Output, EventEmitter } from "@angular/core";
import { PagerService } from "./pagers.service";
import * as _ from "underscore";
import { UpdateResultsService } from "../../_services";

@Component({
  selector: "app-pagers",
  templateUrl: "pagers.component.html",
  styleUrls: ["./pagers.component.scss"],
  providers: [PagerService]
})
export class PagersComponent {
  selected = [];
  deletePagers: any = [];
  addPager: number;
  pagersList: any = [];
  range: boolean = false;
  pagerFrom: number;
  pagerTo: number;
  error: boolean = false;
  errorMsg: string;
  selectAllPagers: boolean = false;
  selectedPagersIndex: number = 0;
  from: number;
  to: number;
  samePagerNumberError: boolean = false;
  samePagerNumberLength: number;
  @Input() pagers: Array<number> = [];
  @Input() type: string;
  @Output() pager: EventEmitter<any> = new EventEmitter();
  @Input() compareData: Array<number> = [];

  constructor(private update: UpdateResultsService) {
    update.updatePager$.subscribe(() => {
      this.samePagerNumberError = false;
      this.error = false;
      this.range = false;
    });
  }

  //to check the range of the pagers entered
  pagersRangeCheck(event) {
    if (event.type == "focus") {
      this.update.updatePagers(true);
    }
    if (this.pagerFrom && this.pagerTo) {
      let pagerDifference =
        this.pagerFrom > this.pagerTo
          ? this.pagerFrom - this.pagerTo
          : this.pagerTo - this.pagerFrom;
      this.error = pagerDifference >= 100 ? true : false;
    }
  }

  // adding pagers
  addPagers() {
    this.samePagerNumberError = false;
    this.pagersList = _.uniq(this.pagers.map(Number));

    //to push the pager number depending on individual or range selection
    if (!this.range) {
      this.addSinglePager();
    } else {
      if (!this.error) {
        this.addRangePagers();
      }
    }
    let compareData = this.compareData.map(Number);
    let e = this.pagersList;
    this.pagersList = _.difference(this.pagersList, compareData);
    let f = this.pagersList;
    if (f.length < e.length) {
      this.showSamePagerError(e, f);
    }
    this.pagersList = _.sortBy(this.pagersList).filter(Number);
    this.pager.emit(this.pagersList);
  }

  // add single pager
  private addSinglePager() {
    this.getCommaSeparatedList();
    let a = _.flatten(this.pagersList);
    this.pagersList = _.uniq(a);
    let b = this.pagersList;
    this.showSamePagerError(a, b);
    this.addPager = null;
  }

  //add range pagers
  private addRangePagers() {
    let self = this;
    if (Number(this.pagerFrom) > Number(this.pagerTo)) {
      this.to = Number(this.pagerFrom) + 1;
      this.from = Number(this.pagerTo);
    } else {
      this.to = Number(this.pagerTo) + 1;
      this.from = Number(this.pagerFrom);
    }
    let pagers = _.range(self.from, self.to);
    _.each(pagers, function(i) {
      self.pagersList.push(i);
    });
    let a = self.pagersList;
    self.pagersList = _.uniq(self.pagersList);
    let b = self.pagersList;
    this.showSamePagerError(a, b);
    this.pagerFrom = null;
    this.pagerTo = null;
  }

  // show error for if pager already exists
  private showSamePagerError(a: Array<number>, b: Array<number>) {
    this.samePagerNumberError = b.length < a.length ? true : false;
    this.samePagerNumberLength = this.samePagerNumberError
      ? a.length - b.length
      : b.length - a.length;
  }

  // spit comma separated array
  private getCommaSeparatedList() {
    let string = JSON.parse(JSON.stringify(this.addPager));
    let cArray = string.split(",");
    cArray = cArray.filter(function(n) {
      return n != undefined && n != "";
    });
    for (let i in cArray) {
      cArray[i] = parseInt(cArray[i]);
    }
    this.pagersList.push(cArray);
  }

  //to select pager number
  public selectPager(index, pager) {
    this.samePagerNumberError = false;
    if (this.selected[index]) {
      this.deletePagers.push(pager);
    } else {
      let removePagerNumber = [];
      removePagerNumber.push(pager);
      this.deletePagers = _.difference(this.deletePagers, removePagerNumber);
    }
    this.selectedPagersIndex = this.deletePagers.length;
  }

  //to delete pager number
  public deletePager() {
    let pagers = _.difference(this.pagers, this.deletePagers);
    this.selected = [];
    this.deletePagers = [];
    this.pager.emit(pagers);
    this.selectedPagersIndex = 0;
    this.selectAllPagers = false;
  }

  //to select all pager numbers
  public selectAll(event) {
    this.samePagerNumberError = false;
    let index = this.pagers.length;
    for (let i = 0; i <= index; i++) {
      this.selected[i] = event.checked ? true : false;
    }
    this.deletePagers = event.checked ? this.pagers : [];
    this.selectedPagersIndex = this.deletePagers.length;
  }
}
