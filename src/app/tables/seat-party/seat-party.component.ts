import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material";
import {
  AlertService,
  SharedDataService,
  UpdateResultsService,
  TimeZoneService
} from "../../_services";
import { SeatViewEditDialog } from "../seat-view-edit-dialog.component";
import { TableService, SeatPartyModel } from "../tables.service";
import { ConfirmDialog } from "../../shared";

@Component({
  selector: "seat-edit-party",
  template: `
  <form name="form" #f="ngForm" novalidate class="dialog-scrollable-content">

  <div class="row mt-3">
    <div class="col-12 text-right py-3 d-flex justify-content-center">
    <div class="d-flex align-items-center">
    <span class="h5 mr-2 text-muted"><span class="font-weight-bold">REGULAR</span></span> 
      <mat-slide-toggle name="event" class="toggle-success" [(ngModel)]="data.isEvent">
        <h5 class="font-weight-bold mt-1 text-muted">EVENT</h5>
      </mat-slide-toggle>
    </div>    </div>
    <div class="col-12"><hr/></div>
  </div>
  <add-guest [parent]="'tables'"></add-guest>
  <div class="text-center dialog-footer">
    <button class="btn btn-primary" (click)="data.guestModel.adultCovers && data.guestModel.guest.name && (data.guestModel.guest.phone && data.guestModel.guest.phone.length >= 7 || !data.guestModel.guest.phone) && addparty()">
    {{data.type == 2 ? 'UPDATE SEAT PARTY':'+ SEAT PARTY'}}
    </button>
  </div>
  </form>`,

  providers: [TableService]
})
export class SeatPartyComponent implements OnInit {
  seatPartyModel: SeatPartyModel = new SeatPartyModel();
  constructor(
    private alertService: AlertService,
    public dialogRef: MatDialogRef<SeatViewEditDialog>,
    private tableService: TableService,
    private shared: SharedDataService,
    public tzone: TimeZoneService,
    public update: UpdateResultsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  addparty() {
    if (this.data.table.mergeDetails == null) {
      this.checkPartyCovers(this.data.table.totalCovers);
    } else {
      var array = this.data.table.mergeDetails.tableIDs;
      this.tableService
        .getTableDetails(array[0], this.shared.getClientID())
        .subscribe(data => {
          this.checkPartyCovers(data.covers);
        });
    }

  }
  checkPartyCovers(totalCovers) {
    if (Number(this.data.guestModel.adultCovers) + Number(this.data.guestModel.childCovers) > Number(totalCovers) ) {
      this.partyExceed();
    } else {
      this.seatParty();
    }
  }
  seatParty() {
    this.seatPartyModel.tableID = this.data.table.tableID;
    this.seatPartyModel = this.data.guestModel;
    this.seatPartyModel.customNotes =
      this.data.guestModel.notes.customNotes == ""
        ? null
        : this.data.guestModel.notes.customNotes;
    this.seatPartyModel.notesToAdd = this.data.guestModel.notes.notes;
    this.seatPartyModel.clientID = this.shared.getClientID();
    if (this.data.type == 2) {
      this.updateParty();
    } else {
      this.confirmSeatParty();
    }
  }

  confirmSeatParty() {
    this.seatPartyModel = this.data.guestModel;
    this.seatPartyModel.tableID = this.data.table.tableID;
    this.seatPartyModel.seatedTime = this.tzone.getClientTimeWithCTZone(new Date());
    this.seatPartyModel.mealCourseID = "";
    this.seatPartyModel.serverID = this.data.table.server ? this.data.table.server.id : null;
    this.seatPartyModel.isEvent = this.data.isEvent;
    this.seatPartyModel.clientID = this.shared.getClientID();
    this.tableService.seatParty(this.seatPartyModel).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.alertService.success("Party seated successfully.");
        this.dialogRef.close();
      },
      error => {
        if (Array.isArray(error.error.errors)) {
          if (
            error.error.errors[0].field != "Guest.Name" &&
            error.error.errors[0].field != "Guest.Phone"
          ) {
            this.alertService.error(error.error.errors[0].message);
          }
        } else {
          this.alertService.error(error.error.message);
        }
      }
    );
  }

  updateParty() {
    this.seatPartyModel = this.data.guestModel;
    this.seatPartyModel.tableID = this.data.table.tableID;
    this.seatPartyModel.seatedTime = this.data.table.seatedTime;
    this.seatPartyModel.mealCourseID = this.data.table.mealCourse ? this.data.table.mealCourse.id : "";
    this.seatPartyModel.serverID = this.data.table.server ? this.data.table.server.id : null;
    this.seatPartyModel.isEvent = this.data.isEvent;
    this.seatPartyModel.clientID = this.shared.getClientID();
    this.tableService.updateParty(this.seatPartyModel).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.alertService.success("Party details updated successfully.");
        this.dialogRef.close();
      },
      error => {
        if (Array.isArray(error.error.errors)) {
          if (
            error.error.errors[0].field != "Guest.Name" &&
            error.error.errors[0].field != "Guest.Phone"
          ) {
            this.alertService.error(error.error.errors[0].message);
          }
        } else {
          this.alertService.error(error.error.message);
        }
      }
    );
  }

  partyExceed() {
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
      if (result) this.seatParty();
    });
  }
}
