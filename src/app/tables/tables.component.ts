import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material";
import {
  D3TableService,
  LoaderService,
  AlertService,
  PlanRenderService,
  SharedDataService,
  FitToView,
  TimeZoneService,
  ModuleStatus
} from "../_services";
import * as _ from "underscore";

import {
  FloorPlanService,
  Table,
  ImmovableShape,
  newObject
} from "../admin/floor-plan/floor-plan.service";
import { WaitlistService } from "../waitlist/waitlist.service";
import { ReservationService } from "../reservation/reservation.service";
import {
  TableService,
  floorPlan,
  ReservationStats,
  WaitListStats
} from "./tables.service";
import { SeatViewEditDialog } from "./seat-view-edit-dialog.component";
import { AvailableTableService } from "../_services/availableTablesCovers";
import { UpdateResultsService } from "../_services/update-results.service";
import { DashBoardService } from "../dashboard/dashboard.service";
import {
  SettingsService,
  Panels,
  Palettes
} from "../settings/settings.service";
import { Subscription } from "rxjs";
import { InitializeService } from "../_services/initialize.service";
import { User } from "../_models";
import { AuthenticationService } from "../authentication/authentication.service";

@Component({
  templateUrl: "tables.component.html",
  styleUrls: ["tables.component.scss"],
  providers: [
    FloorPlanService,
    D3TableService,
    PlanRenderService,
    WaitlistService,
    ReservationService,
    DashBoardService,
    TableService
  ]
})
export class TablesComponent implements OnInit {
  currentUser: User;
  tables: Table[] = [];
  immovables: ImmovableShape[] = [];
  LayoutName: string;
  selectedItemID: number;
  rotation: number = 0;
  position = { x: 0, y: 0 };
  newObject: newObject = new newObject();
  newTable: Table = new Table();
  selectedItem: any;
  selectedFloorPlan: floorPlan = new floorPlan();
  selectedFloorPlanId: any;
  parent: string;
  shiftLayoutID: string;
  totalTops: number = 0;
  totalTables: number = 0;
  floorPlans: any[] = [];
  serverRotations: any[] = [];
  shiftSectionTables: any[] = [];
  serverData: any[] = [];
  selectedRotation: any;
  nextTable: any;
  zoomValue: number = 1;
  svgScale: number = 1;
  fitToView: FitToView = new FitToView();
  totalListParties: number = 0;
  totalListGuests: number = 0;
  selectedTime: Date;
  headerDetail: any;
  notes: any;
  seatedTimerIntervalInstance: any;
  reservationStats: ReservationStats = new ReservationStats();
  waitlistStats: WaitListStats = new WaitListStats();
  listPanelPinned: boolean = false;
  panels: Panels = new Panels();
  colourPalettes: Palettes = new Palettes();

  @ViewChild("planContainer")
  planContainer;
  @ViewChild("svgContainer")
  svgContainer;
  timezone: string;
  modules: ModuleStatus = new ModuleStatus();
  currentDate: Date = new Date();

  private updateFloorPlanSubscription: Subscription;

  constructor(
    private loaderService: LoaderService,
    private floorService: FloorPlanService,
    public dialog: MatDialog,
    private alertService: AlertService,
    private shared: SharedDataService,
    private initialize: InitializeService,
    private planRenderService: PlanRenderService,
    private update: UpdateResultsService,
    private availableTablesService: AvailableTableService,
    public settings: SettingsService,
    public tzone: TimeZoneService,
    private authenticate: AuthenticationService
  ) {
    //this.onResize();
    this.modules = this.initialize.returnModuleStatus();
    this.loaderService.showLoader(true);
    this.timezone = this.tzone.getSavedClientTimeZone();
    this.currentUser = this.authenticate.getUser();

    setInterval(() => {
      this.currentDate = new Date();
    }, 10000);

    this.updateFloorPlanSubscription = update.updateFloorPlan$.subscribe(
      update => {
        this.getLayout(this.selectedFloorPlanId, true);
        this.getAvailableTables(this.selectedFloorPlanId);
      }
    );
  }

  ngOnInit() {
    this.getLayoutLists();
    this.listPanelPinned =
      this.shared.getPanelPinStatus() == "pinned" ? true : false;
    this.loadUserPreferences();
  }

  // clear subscription on destroy
  ngOnDestroy() {
    document.querySelector("body").classList.add("aside-menu-hidden");
    this.updateFloorPlanSubscription.unsubscribe();
  }

  loadUserPreferences() {
    this.initialize
      .getUserPreference(this.currentUser.userID)
      .subscribe(data => {
        this.panels = data.panels;
        this.colourPalettes = data.colourPalettes;
      });
  }

  // get layouots list
  getLayoutLists() {
    this.floorPlans = this.initialize.returnFloorPlanList();
    if (this.floorPlans.length > 0) {
      this.selectFirstItem();
    } else {
      this.loaderService.showLoader(false);
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
      this.getLayout(this.selectedFloorPlanId, false);
      this.loaderService.showLoader(true);
      this.checkAvailabletable();
      this.shared.storeCurrentFloorPlan(this.selectedFloorPlan);
    }
  }

  updateFloorPlan(plan) {
    this.loaderService.showLoader(true);
    this.shared.storeCurrentFloorPlan(plan);
    this.selectedFloorPlan = plan;
    this.selectedFloorPlanId = plan.layoutID;
    this.fitToView.isFit = false;
    this.getLayout(plan.layoutID, true);
    this.checkAvailabletable();
  }

  // get layout results
  getLayout(planID: string, clearcache: boolean) {
    this.floorService.getLayout(planID, this.shared.getClientID()).subscribe(
      data => {
        this.tables = this.planRenderService.createTables(
          data,
          this.selectedFloorPlanId,
          null,
          null
        ).tables;
        this.immovables = this.planRenderService.createImmovables(
          data.immovableStructures,
          this.selectedFloorPlanId
        );
        this.serverRotations = data.rotations;
        this.shiftSectionTables = data.shiftSectionTables;
        this.serverData = data.servers;
        if (this.tables.length > 0 || this.immovables.length > 0) {
          this.fitPlanToView();
        } else {
          this.fitToView.isFit = true;
        }
        //this.getWaitlistDatalist();
        //this.getReservationList();
        this.loaderService.showLoader(false);
      },
      error => {
        this.loaderService.showLoader(false);
        this.alertService.error(error.error.message);
      }
    );
  }

  fitPlanToView() {
    setTimeout(() => {
      this.fitToView = this.planRenderService.fitPlanToView(
        this.planContainer,
        this.svgContainer,
        this.tables,
        this.immovables
      );
      this.zoomValue = this.fitToView.zoomValue;
      this.runSeatedTimer(this.tables);
    }, 100);
  }

  toggleListPanelPin() {
    this.listPanelPinned = !this.listPanelPinned;
    this.shared.storePanelPinStatus(
      this.listPanelPinned ? "pinned" : "unpinned"
    );
  }

  zoomPlan(val: number) {
    if (val == 1 && this.svgScale < 2) {
      this.svgScale = this.svgScale + 0.1;
    } else if (val == -1 && this.svgScale > 1) {
      this.svgScale = this.svgScale - 0.1;
    }
  }

  runSeatedTimer(tables) {
    let self = this;
    clearInterval(this.seatedTimerIntervalInstance);

    let seatedTables = tables.filter(function(t) {
      return t.seatedTime != null;
    });
    this.seatedTimerIntervalInstance = setInterval(() => {
      _.each(seatedTables, function(t) {
        t =
          t.seatedTime &&
          self.planRenderService.updateTimeProgress(t, t.seatedTime);
      });
    }, 20000);
  }

  selectRotation(rotation) {
    let item = rotation;
    if (item == this.selectedRotation) {
      this.selectedRotation = null;
    } else {
      this.nextTable = rotation.serverTableDetails.filter(function(n) {
        return n.tableStatus.id == 1;
      });
      this.selectedRotation = item;
    }
  }

  getAvailableTables(selectedFloorPlanId) {
    this.totalTables = 0;
    this.totalTops = 0;
    let self = this;
    this.availableTablesService
      .getAvailableTables(selectedFloorPlanId, this.shared.getClientID())
      .subscribe(data => {
        _.each(data, function(i) {
          self.totalTops += i.numberOfTop * i.totalTableCount;
          self.totalTables += i.totalTableCount;
        });
      });
  }

  getAvailableTablesNoShift(selectedFloorPlanId) {
    this.totalTables = 0;
    this.totalTops = 0;
    let self = this;
    this.availableTablesService
      .getAvailableTablesNoShift(selectedFloorPlanId, this.shared.getClientID())
      .subscribe(data => {
        _.each(data, function(i) {
          self.totalTops += i.numberOfTop * i.totalTableCount;
          self.totalTables += i.totalTableCount;
        });
      });
  }
  //select table
  selectTable(table: any) {
    table.tableStatus.id == "Occupied"
      ? this.viewSeatedParty(table, null)
      : this.viewSeatedParty(table, "available");
  }

  addPartyToWaitlist(table): void {
    let dialogRef = this.dialog.open(SeatViewEditDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { type: 0, table: table }
    });
    dialogRef.afterClosed().subscribe(result => {});
  }

  viewSeatedParty(table, seatAvailable): void {
    let dialogRef = this.dialog.open(SeatViewEditDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        type: 1,
        table: table,
        shiftLayoutID: this.shiftLayoutID,
        seat: seatAvailable
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // if (result) {
      //   if (result.tableStatus) {
      //     this.updateTable(table, result, "seat");
      //   } else {
      //     this.updateTable(table, null, result);
      //   }
      // }
    });
  }

  updateTable(table: any, tableForUpdate: any, type: string) {
    let self = this;
    let seatedTable = _.findWhere(self.tables, { tableID: table.tableID });
    if (type == "seat") {
      seatedTable.tableStatus = tableForUpdate.tableStatus;
      self.planRenderService.updateTimeProgress(
        seatedTable,
        tableForUpdate.seatedTime
      );
    } else {
      seatedTable.seatedTime = null;
      seatedTable.percent = null;
      seatedTable.tableStatus.id =
        type == "release"
          ? "Available"
          : type == "hold"
            ? "Held"
            : type == "block"
              ? "Blocked"
              : "Available";
    }
  }

  checkAvailabletable() {
    if (this.shared.getShiftLayoutID() == "null") {
      this.getAvailableTablesNoShift(this.selectedFloorPlanId);
    } else {
      this.getAvailableTables(this.selectedFloorPlanId);
    }
  }
}
