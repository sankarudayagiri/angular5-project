import { Component, OnInit, EventEmitter } from "@angular/core";
import {
  CustomizationService,
  CustomizationData
} from "./customization.service";
import { MatChipInputEvent } from "@angular/material";
import { ENTER, COMMA } from "@angular/cdk/keycodes";
import * as _ from "underscore";
import {
  AlertService,
  SharedDataService,
  DiscardDialogService,
  LoaderService,
  ModuleStatus
} from "../../_services";
import { Observable } from "rxjs";
import { JtechAdminService } from "../../super-admin/search/search.service";
import { InitializeService } from "../../_services/initialize.service";

@Component({
  selector: "app-customization",
  templateUrl: "customization.component.html",
  styleUrls: ["customization.component.scss"],
  providers: [CustomizationService, DiscardDialogService]
})
export class CustomizationComponent implements OnInit {
  customizedData: CustomizationData = new CustomizationData();
  discardConfirm: EventEmitter<boolean> = new EventEmitter();
  addChipData: false;
  listNotes: any;
  selectedValue: any;
  savedata: any;
  visits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  weeks = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24
  ];
  addChipOnBlur: boolean = true;
  separatorKeysCodes = [ENTER, COMMA];
  dba: string = "";
  modules: ModuleStatus = new ModuleStatus();

  constructor(
    private DataService: CustomizationService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private discardService: DiscardDialogService,
    private shared: SharedDataService,
    private initialize: InitializeService,
    private JtechAdminService: JtechAdminService
  ) {
    discardService.confirm$.subscribe(confirm => {
      this.discardConfirm.emit(confirm);
    });
  }

  ngOnInit() {
    this.initialize
      .getClientDetails(this.shared.getClientID())
      .subscribe(data => {
        console.log(data);
        this.dba = data.data.dba;
      });
    this.getCustomizationData();
    this.modules = this.initialize.returnModuleStatus();
  }

  getCustomizationData() {
    this.DataService.getCustomizationData(this.shared.getClientID()).subscribe(
      data => {
        data.messageNewReservation = data.messageNewReservation
          ? data.messageNewReservation
          : this.customizedData.messageNewReservation;
        data.messagePageGuest = data.messagePageGuest
          ? data.messagePageGuest
          : this.customizedData.messagePageGuest;
        data.messageWaitListAddGuest = data.messageWaitListAddGuest
          ? data.messageWaitListAddGuest
          : this.customizedData.messageWaitListAddGuest;
        data.messageWaitListCallAhead = data.messageWaitListCallAhead
          ? data.messageWaitListCallAhead
          : this.customizedData.messageWaitListCallAhead;
        data.reservationTextMessagePrefix = data.reservationTextMessagePrefix
          ? data.reservationTextMessagePrefix
          : this.customizedData.reservationTextMessagePrefix;
        data.waitListTextMessagePrefix = data.waitListTextMessagePrefix
          ? data.waitListTextMessagePrefix
          : this.customizedData.waitListTextMessagePrefix;
        this.customizedData = data;
        this.listNotes = this.customizedData.notes;
        this.savedata = JSON.parse(JSON.stringify(this.customizedData));
        this.loaderService.showLoader(false);
      }
    );
  }

  save() {
    this.customizedData.clientID = this.shared.getClientID();
    this.savedata = JSON.stringify(this.customizedData);
    this.DataService.saveCustomizationData(this.customizedData).subscribe(
      data => {
        this.alertService.success("Customization saved successfully.");
        this.savedata = JSON.parse(JSON.stringify(this.customizedData));
      },
      error => {
        this.alertService.error(error.error.message);
        this.loaderService.showLoader(false);
      }
    );
  }

  removeChip(index) {
    this.customizedData.notes.splice(index, 1);
  }

  addChip(event: MatChipInputEvent) {
    let input = event.input;
    let value = event.value;
    let addData = false;
    if (input.value != "") {
      _.each(this.customizedData.notes, function(i) {
        if (i.description.toUpperCase() == value.toUpperCase()) {
          addData = true;
        }
      });
      if (addData == false && value) {
        this.customizedData.notes.push({ description: value });
      }
      if (input) {
        input.value = "";
      }
    }
  }

  // check for unsaved changes

  canDeactivate(): Observable<boolean> | boolean {
    let rulesNotChanged =
      JSON.stringify(this.savedata) === JSON.stringify(this.customizedData);
    if (rulesNotChanged) {
      return true;
    }
    this.discardService.openDiscardChangesDialog();
    return this.discardConfirm;
  }
}
