import { Component, OnInit, Inject, Output, EventEmitter } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material";
import { AlertService, SharedDataService, TimeZoneService } from "../../_services";
import { SeatViewEditDialog } from "../seat-view-edit-dialog.component";
import {
  TableService,
  quickSeatParty
} from "../tables.service";
import { MatDialog } from "@angular/material";
import { UpdateResultsService } from "../../_services/update-results.service";
import { ConfirmDialog } from "../../shared";
import { Subscription } from "rxjs";

@Component({
  selector: "quick-seat-party",
  templateUrl: "./quick-seat-party.component.html",
  styleUrls: ["./quick-seat-party.component.scss"],
  providers: [TableService]
})
export class quickSeatPartyComponent implements OnInit {
  seatPartyModel: quickSeatParty = new quickSeatParty();
  parent: string;
  seatFromListPanelOpen: boolean = false;
  @Output()
  seatPartyDetails: EventEmitter<boolean> = new EventEmitter();

  private updateFloorPlanSubscription: Subscription;

  constructor(
    private alertService: AlertService,
    public dialogRef: MatDialogRef<SeatViewEditDialog>,
    private tableService: TableService,
    private shared: SharedDataService,
    public dialog: MatDialog,
    public tzone: TimeZoneService,
    private update: UpdateResultsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.updateFloorPlanSubscription = update.updateFloorPlan$.subscribe(
      update => {
        this.dialogRef.close();
      }
    );
  }

  ngOnInit() { }

  // clear subscription on destroy
  ngOnDestroy() {
    this.updateFloorPlanSubscription.unsubscribe();
  }

  seatParty() {
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
    if (Number(this.seatPartyModel.adultCovers) + Number(this.seatPartyModel.childCovers) > Number(totalCovers)) {
      this.partyExceed();
    } else {
      this.confirmSeatParty();
    }
  }
  
  confirmSeatParty() {
    this.seatPartyModel.tableID = this.data.table.id
      ? this.data.table.id
      : this.data.table.tableID
        ? this.data.table.tableID
        : null;
    this.seatPartyModel.seatedTime = this.tzone.getClientTimeWithCTZone(
      new Date()
    );
    this.seatPartyModel.clientID = this.shared.getClientID();
    this.tableService.quickSeatParty(this.seatPartyModel).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.alertService.success("Party seated successfully.");
        this.dialogRef.close(data);
      },
      error => {
        this.alertService.error(error.error.message);
      }
    );
  }

  addParty() {
    this.data.guestModel.adultCovers = this.seatPartyModel.adultCovers;
    this.data.guestModel.childCovers = this.seatPartyModel.childCovers;
    this.data.isEvent = this.seatPartyModel.isEvent;
    this.data.type = 0;
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
      if (result) this.confirmSeatParty();
    });
  }

  clear(event) {
    if (event.target.value == 1 && this.data.type != 2) {
      this.seatPartyModel.adultCovers = null;
    }
  }

  clearValue(event) {
    if (event.target.value == 0 && this.data.type != 2) {
      this.seatPartyModel.childCovers = null;
    }
  }
}
