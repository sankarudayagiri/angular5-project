import { Component, OnInit } from "@angular/core";
import * as _ from "underscore";
import { Router } from "@angular/router";

import {
  ShiftLayoutService,
  createSectionLayoutModel,
  floorPlan
} from "./shift-layouts.service";
import {
  LoaderService,
  AlertService,
  SharedDataService,
  InitializeService
} from "../../_services";
import { User } from "../../_models";
import { AuthenticationService } from "../../authentication/authentication.service";

export class EditShiftLayoutNameModel {
  id: string;
  name: string;
  clientID: string;
}

@Component({
  templateUrl: "shift-layouts.component.html",
  styleUrls: ["shift-layouts.component.scss"]
})
export class ShiftLayoutsComponent implements OnInit {
  createSectionLayoutModel: createSectionLayoutModel = new createSectionLayoutModel();
  floorPlans: any[] = [];
  sectionLayouts: any[] = [];
  sectionLayoutName: string;
  selectedFloorPlan: floorPlan = new floorPlan();
  addNewShiftLayout: boolean = false;
  showDeleteConfirm: boolean;
  showResetConfirm: boolean;
  currentUser: User;
  errorMessage: any[] = [];
  optionsEnabled: string;
  showEditWarning: boolean = false;
  showEditWarningID: string;
  editShiftLayoutName: boolean = false;
  editNameShiftLayoutID: string;

  constructor(
    private shiftLayoutService: ShiftLayoutService,
    private loaderService: LoaderService,
    private shared: SharedDataService,
    private initialize: InitializeService,
    private alertService: AlertService,
    private router: Router,
    private authenticate : AuthenticationService
  ) {
    this.loaderService.showLoader(true);
    this.currentUser = this.authenticate.getUser();
  }

  ngOnInit() {
    this.getFloorPlanLists();
  }

  selectFirstItem() {
    this.selectedFloorPlan = _.first(this.floorPlans);
    if (this.selectedFloorPlan) this.getSectionLayoutsList();
  }

  setSelected(plan) {
    this.selectedFloorPlan = plan;
  }

  // get layouots list
  getFloorPlanLists() {
    this.floorPlans = this.initialize.returnFloorPlanList();
    if (this.floorPlans.length > 0) {
      this.selectFirstItem();
    } else {
      this.loaderService.showLoader(false);
    }
  }

  // get section layout list
  getSectionLayoutsList() {
    this.loaderService.showLoader(true);
    this.shiftLayoutService
      .getSectionLayoutsList(
        this.selectedFloorPlan.layoutID,
        this.shared.getClientID()
      )
      .subscribe(
        data => {
          this.sectionLayouts = data;
          this.loaderService.showLoader(false);
        },
        error => {
          this.loaderService.showLoader(false);
        }
      );
  }

  deleteShiftLayout(id: string, index: number) {
    this.loaderService.showLoader(true);
    this.shiftLayoutService
      .deleteShiftLayout(id, this.shared.getClientID())
      .subscribe(
        data => {
          this.sectionLayouts.splice(index, 1);
          this.loaderService.showLoader(false);
          this.alertService.success("Shift Layout deleted successfully.");
        },
        error => {
          this.loaderService.showLoader(false);
          this.alertService.error(error.error.message);
        }
      );
  }

  resetShiftLayout(shiftLayoutID: string) {
    this.loaderService.showLoader(true);
    this.shiftLayoutService
      .resetShiftLayout(
        this.selectedFloorPlan.layoutID,
        this.shared.getClientID(),
        shiftLayoutID
      )
      .subscribe(
        data => {
          this.getSectionLayoutsList();
          this.optionsEnabled = null;
          this.showResetConfirm = false;
          this.alertService.success("Shift Layout Reset successfully.");
        },
        error => {
          this.loaderService.showLoader(false);
          this.alertService.error(error.error.message);
        }
      );
  }

  gotoShiftLayout(status: boolean, shiftlayoutid: string, name: string) {
    if (!status) {
      this.router.navigate(["/staff/shift-layout-detail", shiftlayoutid, name]);
    } else {
      this.showEditWarningID = shiftlayoutid;
    }
  }

  showEditShiftLayoutName(shiftLayoutID: string, name: string) {
    this.editNameShiftLayoutID = shiftLayoutID;
    this.editShiftLayoutName = true;
    this.sectionLayoutName = name;
  }

  //enable options
  enableOptions(id: string) {
    this.optionsEnabled = id;
  }

  //create section layout
  createSectionLayout(type) {
    if (type == "new") {
      this.createSectionLayoutModel.name = this.sectionLayoutName;
      this.createSectionLayoutModel.layoutID = this.selectedFloorPlan.layoutID;
      this.createSectionLayoutModel.clientID = this.shared.getClientID();
      this.shiftLayoutService
        .createSectionLayout(this.createSectionLayoutModel)
        .subscribe(
          data => {
            this.addNewShiftLayout = false;
            this.editShiftLayoutName = false;
            this.router.navigate([
              "/staff/shift-layout-detail",
              data.id,
              this.selectedFloorPlan.layoutName
            ]);
            this.loaderService.showLoader(false);
          },
          error => {
            this.errorMessage = error.error.message;
            this.loaderService.showLoader(false);
          }
        );
    } else {
      let model = new EditShiftLayoutNameModel();
      model.clientID = this.shared.getClientID();
      model.name = this.sectionLayoutName;
      model.id = this.editNameShiftLayoutID;
      this.shiftLayoutService.updateShiftLayoutName(model).subscribe(
        data => {
          this.addNewShiftLayout = false;
          this.editShiftLayoutName = false;
          this.getSectionLayoutsList();
          this.optionsEnabled = null;
          this.loaderService.showLoader(false);
        },
        error => {
          this.errorMessage = error.error.message;
          this.loaderService.showLoader(false);
        }
      );
    }
  }
}
