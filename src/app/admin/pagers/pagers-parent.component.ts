import { Component, OnInit, EventEmitter, ViewChild } from "@angular/core";
import { PagerService, PagersData } from "./pagers.service";
import * as _ from "underscore";
import {
  AlertService,
  SharedDataService,
  DiscardDialogService,
  LoaderService,
  UpdateResultsService
} from "../../_services";
import { MatChipInputEvent } from "@angular/material";
import { ENTER, COMMA } from "@angular/cdk/keycodes";
import { Observable } from "rxjs";
import { PagersComponent } from "./pagers.component";

@Component({
  selector: "app-pagers-parent",
  templateUrl: "pagers-parent.component.html",
  styleUrls: ["./pagers.component.scss"],
  providers: [PagerService, DiscardDialogService]
})
export class PagersParentComponent implements OnInit {
  pagerData: PagersData = new PagersData();
  addChipData: false;
  separatorKeysCodes = [ENTER, COMMA];
  addChipOnBlur: boolean = true;
  savedata: any;
  discardConfirm: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(PagersComponent)
  private PagersComponent: PagersComponent;

  constructor(
    private DataService: PagerService,
    private alertService: AlertService,
    private shared: SharedDataService,
    private discardService: DiscardDialogService,
    private loaderService: LoaderService,
    private update: UpdateResultsService
  ) {
    discardService.confirm$.subscribe(confirm => {
      this.discardConfirm.emit(confirm);
    });
  }

  ngOnInit() {
    this.getPager();
  }

  //to get alpha pagers
  getAlpha(pagers) {
    this.pagerData.alphaPagers = pagers;
  }

  //to get numeric pagers
  getNumeric(pagers) {
    this.pagerData.numericPagers = pagers;
  }

  //to add pager message
  addChip(event: MatChipInputEvent) {
    //this.addChipData = false;
    let input = event.input;
    let value = event.value;
    let addData = false;

    _.each(this.pagerData.pagingMessages, function(i) {
      if (i.toUpperCase() == value.toUpperCase()) {
        addData = true;
      }
    });
    if (addData == false && value) {
      this.pagerData.pagingMessages.push(value);
    }

    if (input) {
      input.value = "";
    }
  }

  //to delete pager message
  removeChip(index) {
    this.pagerData.pagingMessages.splice(index, 1);
  }

  //to get pager data
  getPager() {
    this.DataService.getPagerData(this.shared.getClientID()).subscribe(data => {
      this.pagerData = data;
      this.savedata = JSON.stringify(this.pagerData);
    });
  }

  savePagerSettings() {
    this.loaderService.showLoader(true);
    this.pagerData.clientID = this.shared.getClientID();
    this.savedata = JSON.stringify(this.pagerData);
    this.DataService.savePagerData(this.pagerData).subscribe(
      data => {
        // this.PagersComponent.samePagerNumberError = false;
        // this.PagersComponent.error = false;
        this.update.updatePagers(true);
        this.alertService.success("Pager Settings saved successfully.");

        this.loaderService.showLoader(false);
      },
      error => {
        this.alertService.error(error.error.message);
        this.loaderService.showLoader(false);
      }
    );
  }

  canDeactivate(): Observable<boolean> | boolean {
    let rulesNotChanged = this.savedata === JSON.stringify(this.pagerData);
    if (rulesNotChanged) {
      return true;
    }
    this.discardService.openDiscardChangesDialog();
    return this.discardConfirm;
  }
}
