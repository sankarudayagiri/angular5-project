import { Component, OnInit } from "@angular/core";
import * as _ from "underscore";
import {
  SharedDataService,
  UpdateResultsService,
  AlertService,
  TimeZoneService,
  ModuleStatus
} from "../_services/index";
import { LoaderService } from "../_services/loader.service";
import { WaitlistService } from "../waitlist/waitlist.service";
import { MatDialog } from "@angular/material";
import { ReservationService } from "../reservation/reservation.service";
import { floorPlan } from "../tables/tables.service";
import { ConfirmDialog } from "../shared";
import { InitializeService } from "../_services/initialize.service";
import { User } from "../_models";
import { AuthenticationService } from "../authentication/authentication.service";

export class ReservationsStatusModel {
  clientID: string;
  blockedDate: string;
}

@Component({
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.scss"],
  providers: [ReservationService, WaitlistService]
})
export class DashboardComponent implements OnInit {
  currentUser: User;
  storedPlan: any;
  floorPlans: any[] = [];
  selectedFloorPlan: floorPlan = new floorPlan();
  selectedFloorPlanId: any;
  username: string;
  dateVariable: Date = new Date();
  value: any;
  timezone: string;

  modules: ModuleStatus = new ModuleStatus();

  constructor(
    private loaderService: LoaderService,
    private shared: SharedDataService,
    private initialize: InitializeService,
    private dialog: MatDialog,
    private update: UpdateResultsService,
    private alert: AlertService,
    private authenticate: AuthenticationService,
    private tzone: TimeZoneService
  ) {
    setInterval(() => {
      this.dateVariable = new Date();
    }, 10000);

    this.currentUser = this.authenticate.getUser();
    this.timezone = this.tzone.getSavedClientTimeZone();

    initialize.notifyFloorPlanUpdate$.subscribe(() => {
      this.getLayoutLists();
    });
  }

  ngOnInit() {
    let storedPlan = this.shared.getCurrentFloorPlan();
    this.selectedFloorPlan = storedPlan;
    this.selectedFloorPlanId = storedPlan ? storedPlan.layoutID : null;
    this.modules = this.initialize.returnModuleStatus();
    this.getLayoutLists();
  }

  // get layouots list
  getLayoutLists() {
    this.floorPlans = this.initialize.returnFloorPlanList();
    if (this.floorPlans.length > 0) {
      this.selectFirstItem();
    } else {
      this.selectedFloorPlan = null;
      this.selectedFloorPlanId = null;
    }
  }

  selectFirstItem() {
    if (this.floorPlans.length) {
      let storedPlan = this.shared.getCurrentFloorPlan();
      if (storedPlan) {
        this.selectedFloorPlan = _.findWhere(this.floorPlans, {
          layoutID: storedPlan.layoutID
        });
      } else {
        this.selectedFloorPlan = _.findWhere(this.floorPlans, {
          isInShift: true
        });
        if (!this.selectedFloorPlan) {
          this.selectedFloorPlan = _.first(this.floorPlans);
        }
      }
      this.selectedFloorPlan = this.selectedFloorPlan
        ? this.selectedFloorPlan
        : _.first(this.floorPlans);
      this.selectedFloorPlanId = this.selectedFloorPlan.layoutID;
      this.shared.storeCurrentFloorPlan(this.selectedFloorPlan);
    }
  }

  resetTables() {
    this.loaderService.showLoader(true);
    this.shared
      .resetTables(this.selectedFloorPlanId, this.shared.getClientID())
      .subscribe(
        data => {
          this.loaderService.showLoader(false);
          this.alert.success("All  tables have been vacated and reset.");
          this.update.updateFloorPlan(true);
        },
        error => {
          this.loaderService.showLoader(false);
        }
      );
  }

  confirmResetTables() {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "Confirm",
        type: "danger",
        message:
          "Reset Tables? All seated guests will be vacated and all tables will be reset. This operation cannot be undone."
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.resetTables();
    });
  }

  resetShifts() {
    this.loaderService.showLoader(true);
    this.shared
      .resetShifts(this.selectedFloorPlanId, this.shared.getClientID())
      .subscribe(
        data => {
          this.loaderService.showLoader(false);
          this.alert.success("Both shifts have been reset.");
          this.update.updateFloorPlan(true);
        },
        error => {
          this.loaderService.showLoader(false);
        }
      );
  }

  confirmResetShifts() {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "Confirm",
        type: "danger",
        message:
          "Reset Shifts? All shift slots (both Now and Next) will be emptied. This operation cannot be undone."
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.resetShifts();
    });
  }

  updateFloorPlan(plan) {
    this.shared.storeCurrentFloorPlan(plan);
    this.selectedFloorPlan = plan;
    this.selectedFloorPlanId = plan.layoutID;
  }
}
