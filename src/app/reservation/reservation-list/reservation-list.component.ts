import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material";
import { AddViewEditDialog } from "../add-view-edit-dialog.component";
import {
  ReservationService,
  ReservationStatus
} from "../../reservation/reservation.service";
import {
  SharedDataService,
  AlertService,
  TimeZoneService,
  ModuleStatus,
  InitializeService
} from "../../_services";
import * as _ from "underscore";
import { ScrollEvent } from "ngx-scroll-event";
import { SelectTableComponent } from "../../shared/select-table/select-table.component";
import { ConfirmDialog } from "../../shared";
import { UpdateResultsService } from "../../_services/update-results.service";
import { SeatPartyModel } from "../../waitlist/waitlist.service";

@Component({
  selector: "reservation-list",
  templateUrl: "./reservation-list.component.html",
  styleUrls: ["./reservation-list.component.scss"]
})
export class ReservatonListComponent {
  @Input()
  parent: any;
  @Input()
  reservationData: any;
  @Input()
  type: any;
  @Input()
  noResults: boolean;
  @Input()
  scrollReachedBottom: boolean = false;
  @Input()
  showInterval;
  @Input()
  previousDate: boolean = false;
  @Input()
  today: boolean = true;
  @Input()
  textMessageCount;
  @Input()
  tableID: string;
  reservationStatus: ReservationStatus = new ReservationStatus();
  @Output()
  scrollReachedBottomChange: EventEmitter<boolean> = new EventEmitter();
  timezone: string;
  tableDetails: any;
  constructor(
    public dialog: MatDialog,
    private reservationService: ReservationService,
    private shared: SharedDataService,
    public initialize: InitializeService,
    public update: UpdateResultsService,
    public tzone: TimeZoneService,
    public alert: AlertService
  ) {
    this.timezone = this.tzone.getSavedClientTimeZone();
  }

  ngOnChanges(changes) {
    if (changes && changes.reservationData) {
      this.scrollReachedBottom = false;
    }
  }

  getGuestsCount(data) {
    let guests = 0;
    _.each(data, function(i) {
      guests = guests + (i.adultCovers + i.childCovers);
    });
    return guests;
  }

  seatParty(
    reservationID: string,
    availabilityStatusID: number,
    item: any
  ): void {
    let modules: ModuleStatus = this.initialize.returnModuleStatus();
    if (!modules.hasModuleTable) {
      if (availabilityStatusID == 1) {
        this.movePartyToHistory(reservationID);
      } else {
        this.confirmArrival(item, reservationID, "NoModuleTable");
      }
    } else if (this.tableID) {
      this.getTableDetails(item, this.tableID);
      // this.autoSeatParty(item, this.tableID);
    } else if (item.suggestedTableID) {
      this.autoSeatPartyConfirm(item);
    } else {
      if (availabilityStatusID == 1) {
        this.selectTable(item, reservationID);
      } else {
        this.confirmArrival(item, reservationID, "hasModuleTable");
      }
    }
  }

  movePartyToHistory(waitListDataID: string) {
    this.reservationService
      .movePartyToHistory(waitListDataID, this.shared.getClientID())
      .subscribe(
        data => {
          this.alert.success("Party seated successfully.");
          this.update.updateReservations(true);
        },
        error => {
          this.alert.error(error.error.message);
        }
      );
  }

  autoSeatPartyConfirm(item: any) {
    let msg;
    msg =
      "Seat Party <span class='text-capitalize'>" +
      item.guest.description +
      " </span> at table " +
      item.suggestedTableName +
      " or select a different table?";
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "355px",
      disableClose: true,
      data: {
        button: "Seat",
        type: "success",
        optionalBtn: "Select",
        cancelBtn: true,
        message: msg
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.getTableDetails(item, item.suggestedTableID);
        // this.autoSeatParty(item, item.suggestedTableID);
      } else if (result == "optional") {
        this.selectTable(item, item.reservationID);
      }
    });
  }

  autoSeatParty(item: any, tableID: string) {
    let model = new SeatPartyModel();
    model.id = item.reservationID;
    model.tableID = tableID;
    model.seatedTime = this.tzone.getClientTimeWithCTZone(new Date());
    model.clientID = this.shared.getClientID();
    this.shared.seatReservationParty(model).subscribe(
      data => {
        this.alert.success("Party seated successfully.");
        this.update.updateFloorPlan(true);
        this.update.updateReservations(true);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }
  getTableDetails(reservation: any, tableId) {
    this.shared
      .getTableDetails(tableId, this.shared.getClientID())
      .subscribe(data => {
        this.tableDetails = data;
        this.checkPartyCovers(reservation, this.tableDetails.covers, tableId);
      });
  }

  checkPartyCovers(reservation: any, totalcovers: number, tableId) {
    if (reservation.adultCovers + reservation.childCovers > totalcovers) {
      let dialogRef = this.dialog.open(ConfirmDialog, {
        width: "300px",
        disableClose: true,
        data: {
          button: "CONFIRM",
          type: "danger",
          cancelBtn: true,
          message: "Party Size exceeds available seats, proceed?"
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.autoSeatParty(reservation, tableId);
        }
      });
    } else {
      this.autoSeatParty(reservation, tableId);
    }
  }

  selectTable(item, reservationID) {
    let dialogRef = this.dialog.open(SelectTableComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { item: item, ID: reservationID, type: "seat-reservation" }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.update.updateReservations(true);
        this.update.updateFloorPlan(true);
      }
    });
  }

  confirmArrival(item, reservationID: string, type: string) {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "Confirm",
        type: "success",
        message: "Confirm Party Arrival?"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (type == "hasModuleTable") {
          this.selectTable(item, reservationID);
          this.updateStatus(reservationID);
        } else {
          this.movePartyToHistory(reservationID);
        }
      }
    });
  }

  updateStatus(reservationID: string) {
    this.reservationStatus.statusID = 1;
    this.reservationStatus.clientID = this.shared.getClientID();
    this.reservationStatus.reservationID = reservationID;
    this.reservationService
      .updateStatus(this.reservationStatus)
      .subscribe(data => {
        this.alert.success("Party arrival status updated successfully.");
        this.update.updateReservations(true);
      });
  }

  //view reservation modal
  viewReservation(reservationId: number): void {
    this.dialog.open(AddViewEditDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { type: 1, view: "view", id: reservationId, today: this.today }
    });
  }

  //undo no-show
  undoNoShow(reservationHistoryId: string) {
    this.reservationService
      .undoNoshow(reservationHistoryId, this.shared.getClientID())
      .subscribe(
        data => {
          this.update.updateReservations(true);
          this.alert.success("Successfully Added Party back to Reservations");
        },
        error => {
          this.alert.error(error.error.errors[0].message);
        }
      );
  }

  confirmUndoNoShow(reservationHistoryID: string) {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "CONFIRM",
        type: "danger",
        message: "Are you sure you want to undo No-Show?"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.undoNoShow(reservationHistoryID);
    });
  }

  handleScroll(event: ScrollEvent) {
    if (
      event.isReachingBottom &&
      !this.scrollReachedBottom &&
      !this.noResults
    ) {
      this.scrollReachedBottom = true;
      this.scrollReachedBottomChange.emit(true);
    }
  }
}
