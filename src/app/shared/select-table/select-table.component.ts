import { Component, Inject, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import * as _ from "underscore";
import {
  SharedDataService,
  PlanRenderService,
  AlertService,
  FitToView,
  TimeZoneService,
  InitializeService
} from "../../_services";
import {
  FloorPlanService,
  Table,
  ImmovableShape
} from "../../admin/floor-plan/floor-plan.service";
import { UpdateResultsService } from "../../_services/update-results.service";
import { TableService } from "../../tables/tables.service";
import {
  ReservationService,
  ReservationModel
} from "../../reservation/reservation.service";
import { stringTimeToDatePipe } from "../../_pipes";
import { SeatPartyModel } from "../../waitlist/waitlist.service";
import { User } from "../../_models";
import { AuthenticationService } from "../../authentication/authentication.service";
import { ConfirmDialog } from "../confirm-dialog.component";

export class mergeModel {
  primaryTableID: string;
  secondaryTableIDs: any[] = [];
  clientID: string;
}

export class moveSeatedPartyModel {
  fromTable: string;
  toTable: string;
  clientID: string;
}

export class WaitListSuggestTableModel {
  ClientID: string;
  TableID: string;
  waitListDataID: string;
}

@Component({
  selector: "select-table-view",
  templateUrl: "select-table.component.html",
  styleUrls: ["select-table.component.scss"],
  providers: [
    FloorPlanService,
    PlanRenderService,
    TableService,
    stringTimeToDatePipe,
    ReservationService
  ]
})
export class SelectTableComponent {
  currentUser: User;
  tables: Table[] = [];
  parentTable: any;
  immovables: ImmovableShape[] = [];
  selectedFloorPlanName: string;
  fitToView: FitToView = new FitToView();
  floorPlans: any[] = [];
  selectedFloorPlanId: string;
  selectedMergingTables: any[] = [];
  selectedFloorPlan: any;
  storedPlan: any;
  reservationModel: ReservationModel = new ReservationModel();
  mergedPrimaryTable: string = null;
  zoomValue: number = 1;
  svgScale: number = 1;
  mergedTableCovers: number;

  @ViewChild("planContainer")
  planContainer;
  @ViewChild("svgContainer")
  svgContainer;

  constructor(
    public dialog: MatDialog,
    private shared: SharedDataService,
    private floorService: FloorPlanService,
    private tableService: TableService,
    private reservationService: ReservationService,
    private planRenderService: PlanRenderService,
    private update: UpdateResultsService,
    public alert: AlertService,
    public tzone: TimeZoneService,
    public dialogRef: MatDialogRef<SelectTableComponent>,
    public initialize: InitializeService,
    private authenticate  :AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.currentUser = this.authenticate.getUser();
  }

  ngOnInit() {
    this.storedPlan = this.shared.getCurrentFloorPlan();
    let planID = this.storedPlan ? this.storedPlan.layoutID : null;
    planID ? this.getLayout(planID) : this.getLayoutLists();
  }

  // get layouots list
  getLayoutLists() {
    this.floorPlans = this.initialize.returnFloorPlanList();
    if (this.floorPlans.length > 0) {
      this.selectFirstItem();
    } else {
      this.fitToView.isFit = true;
    }
  }

  selectFirstItem() {
    if (this.floorPlans.length) {
      this.selectedFloorPlan = _.findWhere(this.floorPlans, {
        isInShift: true
      });
      this.selectedFloorPlan = this.selectedFloorPlan
        ? this.selectedFloorPlan
        : _.first(this.floorPlans);
      this.selectedFloorPlanId = this.selectedFloorPlan.layoutID;
      this.getLayout(this.selectedFloorPlanId);
      this.shared.storeCurrentFloorPlan(this.selectedFloorPlan);
    }
  }

  updateParentTable(table) {
    let t = _.findWhere(this.tables, {
      tableID: table.tableID
    });
    t.tableSelectedClass = "table-selected";
    this.selectedMergingTables.push(t.tableID);
    return t;
  }

  // get layout results
  getLayout(planID: string) {
    this.floorService.getLayout(planID, this.shared.getClientID()).subscribe(
      data => {
        this.fitToView.isFit = false;
        this.tables = this.planRenderService.createTables(
          data,
          planID,
          null,
          null
        ).tables;
        this.immovables = this.planRenderService.createImmovables(
          data.immovableStructures,
          planID
        );
        if (this.tables.length > 0 || this.immovables.length > 0) {
          this.fitPlanToView();
        } else {
          this.fitToView.isFit = true;
        }
        if (this.data.table && this.data.type == "link") {
          this.parentTable = this.updateParentTable(this.data.table);
        }
        this.selectedFloorPlanName = data.layoutName;
      },
      error => {
        this.fitToView.isFit = true;
        this.alert.error(error.error.message);
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
    }, 100);
  }

  zoomPlan(val: number) {
    if (val == 1 && this.svgScale < 2) {
      this.svgScale = this.svgScale + 0.1;
    } else if (val == -1 && this.svgScale > 1) {
      this.svgScale = this.svgScale - 0.1;
    }
  }

  updateFloorPlan(plan) {
    this.selectedFloorPlanName = plan.layoutName;
    this.getLayout(plan.layoutID);
  }

  checkAvailableSeats(table: any) {
    if(this.data.type!='suggest-waitlist' && this.data.type!= 'suggest-reservation'){
      if (table.mergeDetails) {
        var array = table.mergeDetails.tableIDs;
        this.tableService
          .getTableDetails(array[0], this.shared.getClientID())
          .subscribe(data => {
            this.mergedTableCovers = data.covers;
            this.checkPartyCovers(table, data.covers);
          });
      } else {
        this.checkPartyCovers(table, table.totalCovers);
      }
    }
   else{
    this.selectTable(table); 
   }
  }

  checkPartyCovers(table: any, totalcovers: number) {
    if (this.data.item.adultCovers + this.data.item.childCovers > totalcovers) {
      let dialogRef = this.dialog.open(ConfirmDialog, {
        width: "300px",
        disableClose: true,
        data: {
          button: "Confirm",
          type: "danger",
          cancelBtn: true,
          message: "Party Size exceeds available seats, proceed?"
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) this.selectTable(table);
      });
    } else {
      this.selectTable(table);
    }
  }

  //select table
  selectTable(table: any) {
    let model = new SeatPartyModel();
    model.id = this.data.ID;
    model.tableID = table.id;
    model.seatedTime = this.tzone.getClientTimeWithCTZone(new Date());
    model.clientID = this.shared.getClientID();

    switch (this.data.type) {
      case "seat-reservation": {
        this.seatReservationParty(model);
        break;
      }
      case "seat-waitlist": {
        this.seatWaitListParty(model);
        break;
      }
      case "suggest-reservation": {
        this.suggestReservationTable(table);
        break;
      }
      case "suggest-waitlist": {
        this.suggestWaitListTable(table);
        break;
      }
      case "link": {
        (table.tableStatus.id == "Available" ||
          table.tableStatus.id == "Occupied") &&
          this.updateMergingTables(table);
        break;
      }
      case "moveparty": {
        this.moveSeatedParty(table);
        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }

  updateMergingTables(table) {
    let self = this;
    this.mergedPrimaryTable = table.mergeDetails
      ? table.mergeDetails.primaryTableID
      : null;
    table.tableSelectedClass =
      table.tableSelectedClass == "table-selected"
        ? "table-deselected"
        : "table-selected";
    let t = _.indexOf(this.selectedMergingTables, table.tableID);
    if (t == -1) {
      if (table.mergeDetails) {
        _.each(table.mergeDetails.tableIDs, function(t) {
          let st = _.findWhere(self.tables, { tableID: t });
          st.tableSelectedClass = "table-selected";
          self.selectedMergingTables.push(t);
        });
      } else {
        this.selectedMergingTables.push(table.tableID);
      }
    } else {
      if (table.mergeDetails) {
        _.each(table.mergeDetails.tableIDs, function(t) {
          let st = _.findWhere(self.tables, { tableID: t });
          st.tableSelectedClass = "table-deselected";
          let mt = _.indexOf(self.selectedMergingTables, t);
          self.selectedMergingTables.splice(mt, 1);
        });
      } else {
        this.selectedMergingTables.splice(t, 1);
      }
    }
  }

  doMerge() {
    let model = new mergeModel();
    model.clientID = this.shared.getClientID();
    model.primaryTableID = this.mergedPrimaryTable
      ? this.getPrimaryTableID(this.mergedPrimaryTable)
      : this.getPrimaryTableID(this.data.table.tableID);
    model.secondaryTableIDs = this.selectedMergingTables;
    this.tableService.tablesMerge(model).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.alert.success("Tables are linked successfully.");
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 1000);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  getPrimaryTableID(tableID: string) {
    let primaryIDIndex = _.indexOf(this.selectedMergingTables, tableID);
    let primaryID =
      primaryIDIndex != -1 ? tableID : _.first(this.selectedMergingTables);
    this.selectedMergingTables.splice(
      primaryIDIndex != -1 ? primaryIDIndex : 0,
      1
    );
    return primaryID;
  }

  seatReservationParty(model) {
    this.shared.seatReservationParty(model).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.dialogRef.close(true);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  seatWaitListParty(model) {
    this.shared.seatWaitListParty(model).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.dialogRef.close(true);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  //suggest table for reservation
  suggestReservationTable(table: any) {
    this.reservationModel = this.data.guestModel;
    this.reservationModel.notesToAdd = this.selectedNotes();
    this.reservationModel.clientID = this.shared.getClientID();
    this.reservationModel.suggestedTableID = table.id;
    this.updateReservation();
  }

  selectedNotes() {
    let notes = _.pluck(_.where(this.data.guestModel.notes.notes), "id");
    notes = notes.filter(function(n) {
      return n != undefined;
    });
    return notes;
  }

  updateReservation() {
    this.reservationModel.currentDate = this.tzone.getLocalTimeWithCTZone(
      this.reservationModel.reservationTime
    );
    this.reservationService.editReservaion(this.reservationModel).subscribe(
      data => {
        this.update.updateReservations(true);
        this.update.updateTimeSlots(true);
        this.alert.success("Table suggested successfully.");
        this.dialogRef.close();
      },
      error => {
        this.alert.error(error.errors.message);
      }
    );
  }

  //suggested table
  suggestWaitListTable(table: any) {
    let waitlistsuggest = new WaitListSuggestTableModel();
    waitlistsuggest.waitListDataID = this.data.ID;
    waitlistsuggest.TableID = table.id;
    waitlistsuggest.ClientID = this.shared.getClientID();
    this.shared.sugestTable(waitlistsuggest).subscribe(
      data => {
        this.alert.success("Table suggested successfully.");
        this.update.updateWaitlist(true);
        this.dialogRef.close();
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  moveSeatedParty(table: any) {
    let model = new moveSeatedPartyModel();
    model.clientID = this.shared.getClientID();
    model.toTable = table.id;
    model.fromTable = this.data.table.tableID;
    this.shared.moveSeatedParty(model).subscribe(
      data => {
        this.dialogRef.close(true);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
