import { Component, OnInit, Inject, Input, ViewChild} from "@angular/core";
import {
  AlertService,
  SharedDataService,
  LoaderService
} from "../../_services/index";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material";
import { ViewPartyDataService } from "../../_services/view-party-data.service";
import { GuestDetailModel } from "../../_services";
import {
  TableService,
  BlockTable,
  HoldTable,
  AssignServer,
  TextMessage,
  SeatPartyModel
} from "../tables.service";
import * as _ from "underscore";
import { WaitlistAddViewEditDialog } from "../../waitlist/add-view-edit-dialog.component";
import { ConfirmDialog, ViewTabsComponent } from "../../shared";
import { UpdateResultsService } from "../../_services/update-results.service";
import { SelectTableComponent } from "../../shared/select-table/select-table.component";
// import { unlink } from "fs";

export class UserInfo {
  adultCovers: number = 0;
  childCovers: number = 0;
  guest = { id: 0, name: null, phone: 0 };
  total: number = 0;
  notes = { customNotes: null, notes: null };
  priority: object = { id: null, description: null };
  totalNotes: any;
  reservationID: string;
  reservationTime: Date;
  createdDate: Date;
}

export class unLinkModel {
  mergeID: string;
  clientID: string;
}

@Component({
  selector: "view-seated-party",
  templateUrl: "./view-seated-party.component.html",
  styleUrls: ["./view-seated-party.component.scss"]
})
export class ViewSeatedPartyComponent implements OnInit {
  guestModel: GuestDetailModel = new GuestDetailModel();

  @Input()
  type: any;
  open: 1;
  textMessage: TextMessage = new TextMessage();
  block: BlockTable = new BlockTable();
  hold: HoldTable = new HoldTable();
  server: AssignServer = new AssignServer();
  userDetails: UserInfo = new UserInfo();
  guestId: number;
  table: any;
  visitHistory: any[] = [];
  spentTime: number;
  showWaitlist: boolean = false;
  showWaitlistTab: boolean = false;
  showAddPartyDetails: boolean = false;
  SeatParty: SeatPartyModel = new SeatPartyModel();
  tab: boolean = true;
  @ViewChild(ViewTabsComponent)
  private ViewTabsComponent: ViewTabsComponent;
  constructor(
    private alert: AlertService,
    private dataService: ViewPartyDataService,
    private shared: SharedDataService,
    private tableService: TableService,
    private loaderService: LoaderService,
    public dialogRef: MatDialogRef<WaitlistAddViewEditDialog>,
    private update: UpdateResultsService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.loaderService.showLoader(true);
  }

  ngOnInit() {
    this.getTableDetails();
  }

  getTableDetails() {
    this.tableService
      .getTableDetails(this.data.table.tableID, this.shared.getClientID())
      .subscribe(
        data => {
          this.userDetails = data.partyDetails;
          this.data.guestModel = data.partyDetails;
          this.data.table.mealCourse = data.mealCourse;
          this.table = data;
          this.visitHistory = data.visitHistory;
          this.userDetails.total =
            this.userDetails.adultCovers + this.userDetails.childCovers;
        },

        error => {}
      );
  }

  messageSend() {
    this.loaderService.showLoader(true);
    this.textMessage.clientID = this.shared.getClientID();
    this.textMessage.tableID = this.data.table.tableID;
    console.log(this.data)
    this.tableService.tableDetailTextMessage(this.textMessage).subscribe(
      data => {
        this.loaderService.showLoader(false);
        this.textMessage.messageText = "";
        this.alert.success("Message sent successfully");
        this.ViewTabsComponent.getTextMessage();
      },
      error => {
        this.loaderService.showLoader(false);
        this.alert.error(error.error.message);
      }
    );
  }

  onSelectionChange(value) {
    this.SeatParty = this.data.guestModel;
    this.SeatParty.tableID = this.data.table.tableID;
    this.SeatParty.clientID = this.shared.getClientID();
    this.SeatParty.notesToAdd = this.selectedNotes();
    this.SeatParty.customNotes = this.data.guestModel.notes.customNotes == "" ? null : this.data.guestModel.notes.customNotes;
    this.SeatParty.serverID =
      this.data.table.server != null ? this.data.table.server.id : null;
    this.SeatParty.isEvent = this.data.table.isEvent;
    this.SeatParty.mealCourseID = value;
    this.SeatParty.seatedTime = this.data.table.seatedTime;
    this.tableService.updateParty(this.SeatParty).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.data.table.mealCourse ? (this.table.mealCourse.id = value) : null;
        this.alert.success("Meal course updated successfully.");
        setTimeout(() => {
          this.dialogRef.close();
        }, 100);
      },
      error => {
        this.loaderService.showLoader(false);
        this.alert.error(error.error.message);
      }
    );
  }

  selectedNotes() {
    let notes = _.pluck(_.where(this.data.guestModel.notes.notes), "id");
    notes = notes.filter(function(n) {
      return n != undefined;
    });
    return notes;
  }

  editparty() {
    this.data.type = 2;
    this.data.isEvent = this.data.table.isEvent;
  }

  blockTable() {
    this.block.tableID = this.data.table.tableID;
    this.block.clientID = this.shared.getClientID();
    this.tableService.blockTable(this.block).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.alert.success("Table is blocked successfully.");
        this.dialogRef.close("block");
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  confirmBlock() {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "CONFIRM",
        type: "danger",
        message:
          "Are you sure you want to Block Table? This operation cannot be undone."
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.blockTable();
    });
  }

  //hold table
  holdTable() {
    this.hold.guestID = this.data.guestModel.guest
      ? this.data.guestModel.guest.id
      : "";
    this.hold.tableID = this.data.table.tableID;
    this.hold.clientID = this.shared.getClientID();
    this.tableService.holdTable(this.hold).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.alert.success("Table is put on hold successfully.");
        this.dialogRef.close("hold");
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  confirmHold() {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "CONFIRM",
        type: "danger",
        message:
          "Are you sure you want to Hold Table? This operation cannot be undone."
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.holdTable();
    });
  }

  releaseTable() {
    this.hold.guestID = this.data.guestModel.guest
      ? this.data.guestModel.guest.id
      : "";
    this.hold.tableID = this.data.table.tableID;
    this.hold.clientID = this.shared.getClientID();
    this.tableService.releaseTable(this.hold).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.alert.success(" Table is released successfully.");
        this.dialogRef.close(true);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  confirmTableRelease() {
    if (this.data.seat == "available") {
      this.releaseTable();
    } else {
      this.seatTimeCheck("release");
    }
  }

  releaseTableDialog() {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "Confirm",
        type: "danger",
        message:
          "Are you sure you want to release the Table? This operation cannot be undone."
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.releaseTable();
    });
  }

  seatTimeCheck(type) {
    var time = this.data.table.spentTime.split(":");
    if (time[1] < "05" && time[0] == "00") {
      this.moveRestoreParty(type);
    } else {
      type == "block"
        ? this.confirmBlock()
        : type == "release"
          ? this.releaseTableDialog()
          : this.confirmHold();
    }
  }

  selectedTabChange(tabSelected) {
    this.tab = tabSelected == "history" ? false : true;
  }

  moveRestoreParty(type: string) {
    let msg, partyName, btnName;

    if (this.data.table.reservationHistoryID != null) {
      msg = "Move Party to new table or Restore party to Reservation ?";
      btnName = "RESTORE";
    } else if (this.data.table.waitListDataHistoryID != null) {
      msg = "Move Party to new table or Restore party to Wait List ?";
      btnName = "RESTORE";
    } else {
      msg = "Move Party to new table or Undo seating?";
      btnName = "UNDO SEATING";
    }
    partyName = this.data.guestModel.guest
      ? this.data.guestModel.guest.name
      : "";

    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "355px",
      disableClose: true,
      data: {
        button: "MOVE",
        type: "success",
        optionalBtn: btnName,
        cancelBtn: true,
        message: "Party " + partyName + " is seated less than 5 minutes. " + msg
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        let dialogRef = this.dialog.open(SelectTableComponent, {
          width: "100vw",
          panelClass: "full-size-dialog",
          data: { item:this.data.guestModel,table: this.data.table, type: "moveparty" }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            type == "block" && this.blockTable();
            type == "hold" && this.holdTable();
            if (type == "release") {
              this.update.updateFloorPlan(true);
              setTimeout(() => {
                this.dialogRef.close();
              }, 100);
            }
          }
        });
      } else if (result == "optional") {
        if ((btnName = "UNDO SEATING")) {
          this.undoSeating();
        } else {
          this.releaseTable();
        }
      }
    });
  }

  confirmUnLink() {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "Confirm",
        type: "danger",
        message:
          "Are you sure you want to unlink the Tables? This operation cannot be undone."
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.unLinkTables();
    });
  }

  linkTables() {
    let dialogRef = this.dialog.open(SelectTableComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { item:this.data.guestModel, table: this.data.table, type: "link", tables: this.data.tables }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.dialogRef.close();
    });
  }

  unLinkTables() {
    let model = new unLinkModel();
    model.clientID = this.shared.getClientID();
    model.mergeID = this.data.table.mergeDetails.mergeID;
    this.tableService.tablesUnlink(model).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.alert.success("Tables are unlinked successfully.");
        setTimeout(() => {
          this.dialogRef.close();
        }, 100);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  showSeatParty(event) {
    this.showAddPartyDetails = event;
    this.showWaitlist = true;
  }
  
  undoSeating() {
    this.tableService
      .tablesUndoSeating(this.data.table.tableID, this.shared.getClientID())
      .subscribe(
        data => {
          if(this.data.table.waitListDataHistoryID){
            this.update.updateWaitlist(true);
          }
          if(this.data.table.reservationHistoryID){
            this.update.updateReservations(true);
          }
          this.dialogRef.close(true);
          this.alert.success("Seating Undone successfully");
          this.update.updateFloorPlan(true);
        },
        error => {
          this.alert.error(error.error.message);
        }
      );
  }
}
