import { Component, OnInit, Inject, Input, ViewChild } from "@angular/core";
import {
  AlertService,
  LoaderService,
  SharedDataService,
  TimeZoneService,
  ModuleStatus,
  InitializeService
} from "../../_services/index";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material";
import { ViewPartyDataService } from "../../_services/view-party-data.service";
import { GuestDetailModel } from "../../_services";
import {
  WaitListData,
  ReservationService,
  ReservationStatus
} from "../reservation.service";
import { AddViewEditDialog } from "../add-view-edit-dialog.component";
import { ConfirmDialog, ViewTabsComponent } from "../../shared";
import { UpdateResultsService } from "../../_services/update-results.service";
import { SelectTableComponent } from "../../shared/select-table/select-table.component";
import { FormControl } from "@angular/forms";
import { SeatPartyModel } from "../../waitlist/waitlist.service";
// import { constants } from "os";

export class UserInfo {
  adultCovers: number = 0;
  childCovers: number = 0;
  guest = { id: "", name: null, phone: 0 };
  total: number = 0;
  notes = { customNotes: null, notes: null };
  availabilityStatus = { id: 0, description: "none" };
  totalNotes: any;
  reservationID: string = "";
  reservationTime: Date;
  createdDate: Date;
  visitHistory: any;
  suggestedTableName: string;
}

export class guestMessage {
  messageText: string = null;
  reservationID: string = "";
  clientID: string;
  saveMessage: boolean = false;
  isFromWeb: boolean = true;
}

@Component({
  selector: "view-reservation",
  templateUrl: "./view-reservation.component.html",
  styleUrls: ["./view-reservation.component.scss"]
})
export class ViewReservationComponent implements OnInit {
  guestModel: GuestDetailModel = new GuestDetailModel();
  @Input()
  type: any;
  open: 1;
  userDetails: UserInfo = new UserInfo();
  message: guestMessage = new guestMessage();
  guestId: number;
  waitListData: WaitListData = new WaitListData();
  showWaitlist: boolean = false;
  selectedWaitlistID: string = null;
  reservationStatus: ReservationStatus = new ReservationStatus();
  notArrived: boolean = false;
  tab: boolean = true;
  today: boolean = true;
  textMessageCount: number;
  @ViewChild(ViewTabsComponent)
  private ViewTabsComponent: ViewTabsComponent;
  timezone: string;
  modules: ModuleStatus = new ModuleStatus();
  tableDetails:any
  constructor(
    private alertService: AlertService,
    private dataService: ViewPartyDataService,
    private loaderService: LoaderService,
    private shared: SharedDataService,
    public initialize: InitializeService,
    private ReservationService: ReservationService,
    public dialogRef: MatDialogRef<AddViewEditDialog>,
    public dialog: MatDialog,
    public tzone: TimeZoneService,
    public update: UpdateResultsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.loaderService.showLoader(true);
    this.timezone = this.tzone.getSavedClientTimeZone();
  }

  ngOnInit() {
    this.getReservationData();
    this.modules = this.initialize.returnModuleStatus();
  }

  getReservationData() {
    this.dataService
      .getReservationData(this.data.id, this.shared.getClientID())
      .subscribe(data => {
        this.data.date = new FormControl(
          this.tzone.getClientDateTimeWithLTZone(data.reservationTime)
        );
        this.userDetails = data;
        this.data.guestModel = data;
        this.textMessageCount = data.textMessages.length;
        this.data.guestModel.reservationTime = this.tzone.getClientDateTimeWithLTZone(
          data.reservationTime
        );
        this.userDetails.total =
          this.userDetails.adultCovers + this.userDetails.childCovers;
      });
  }

  selectedTabChange(tabSelected) {
    this.tab = tabSelected == "history" ? false : true;
  }

  messageSend() {
    this.getReservationData();
    if (this.textMessageCount < 2) {
      this.sendMessage();
    } else {
      let dialogRef = this.dialog.open(ConfirmDialog, {
        width: "355px",
        disableClose: true,
        data: {
          button: "CONFIRM",
          type: "danger",
          cancelBtn: true,
          message:
            "Party <span class='text-capitalize'> " +
            this.userDetails.guest.name +
            " </span> has been paged 3 times via SMS. Do you wish to continue?"
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.sendMessage();
        } else {
          this.dialogRef.close();
        }
      });
    }
  }
  sendMessage() {
    this.loaderService.showLoader(true);
    this.message.clientID = this.shared.getClientID();
    this.message.reservationID = this.userDetails.reservationID;
    this.dataService.postTextMessage(this.message).subscribe(
      data => {
        this.loaderService.showLoader(false);
        this.message.messageText = "";
        this.alertService.success("Message sent successfully");
        this.ViewTabsComponent.getTextMessage();
        this.update.updateReservations(true);
      },
      error => {
        this.loaderService.showLoader(false);
        this.alertService.error(error.error.message);
      }
    );
  }

  editparty() {
    this.data.type = 2;
  }

  confirmDelete() {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "Confirm",
        type: "danger",
        message:
          "Are you sure you want to Delete? This operation cannot be undone."
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.deleteReservation();
    });
  }

  confirmNoShow() {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "CONFIRM",
        type: "danger",
        message: "Are you sure you want to add guest to No-Show?"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.noShow();
    });
  }

  confirmMoveToWaitlist(selectedWaitlistId) {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "Confirm",
        type: "danger",
        message:
          "Are you sure you want to move guest to Wait List " +
          this.data.selectedWaitlistName +
          "?"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.moveToWaitlist(selectedWaitlistId);
    });
  }

  //move to waitlist
  moveToWaitlist(selectedWaitlistId: string) {
    this.waitListData.quotedWaitTime = "00:20";
    this.waitListData.waitListID = selectedWaitlistId;
    this.waitListData.clientID = this.shared.getClientID();
    this.waitListData.reservationID = this.userDetails.reservationID;
    this.ReservationService.addToWaitlist(this.waitListData).subscribe(
      data => {
        this.update.updateReservations(true);
        this.update.updateWaitlist(true);
        this.dialogRef.close(true);
        this.alertService.success("Party moved to Wait List Successfully");
      },
      error => {
        this.alertService.error(error.error.message);
      }
    );
  }

  noShow() {
    this.ReservationService.noshow(
      this.userDetails.reservationID,
      this.shared.getClientID()
    ).subscribe(data => {
      this.update.updateReservations(true);
      this.alertService.success("Party moved to No-Show successfully.");
      this.dialogRef.close(true);
    });
  }

  deleteReservation() {
    this.ReservationService.deleteReservation(
      this.userDetails.reservationID,
      this.shared.getClientID()
    ).subscribe(data => {
      this.alertService.success("Reservation deleted successfully.");
      this.update.updateReservations(true);
      this.dialogRef.close(true);
    });
  }

  onSelectionChange(value,userDetails) {
    if (value == "partyArrived") {
      this.confirmArrival(value, false,userDetails,"hasModuleTable");
    } else {
      this.updateStatus(value, false);
    }
  }

  confirmArrival(reservationID: string, seatparty: boolean,item:any,type:string) {
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
        if( type=="hasModuleTable"){
          if (seatparty) {
            this.selectTable(reservationID,item);
          }
          this.updateStatus(reservationID, seatparty);
        }
        else{
          this.movePartyToHistory(reservationID);
        }}
    });
  }

  updateStatus(value: string, seatparty: boolean) {
    let statusID = value == "partyArrived" ? 1 : value == "partyCalled" ? 2 : 3;
    this.reservationStatus.statusID = seatparty ? 1 : statusID;
    this.reservationStatus.clientID = this.shared.getClientID();
    this.reservationStatus.reservationID = this.data.guestModel.reservationID;
    this.ReservationService.updateStatus(this.reservationStatus).subscribe(
      data => {
        this.alertService.success("Party arrival status updated successfully.");
        this.userDetails.availabilityStatus.id = this.reservationStatus.statusID;
        this.update.updateReservations(true);
        this.getReservationData();
      }
    );
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
        this.confirmArrival(reservationID, true,item,"NoModuleTable");
      }
     
    }
    else if (item.suggestedTableID) {
      this.autoSeatPartyConfirm(item);
    } else {
      if (availabilityStatusID == 1) {
        this.selectTable(reservationID,item);
      } else {
        this.confirmArrival(reservationID, true,item,"hasModuleTable");
      }
    }
  }

  movePartyToHistory(waitListDataID: string) {
    this.ReservationService
      .movePartyToHistory(waitListDataID, this.shared.getClientID())
      .subscribe(
        data => {
          this.alertService.success("Party seated successfully.");
          this.dialogRef.close();
          this.update.updateFloorPlan(true);
          this.update.updateReservations(true);
        },
        error => {
          this.alertService.error(error.error.message);
        }
      );
  }

  autoSeatPartyConfirm(item: any) {
    let msg;
    msg =
      "Seat Party <span class='text-capitalize'>" +
      item.guest.name +
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
        this.getTableDetails(item)
        // this.autoSeatParty(item);
      } else if (result == "optional") {
        this.selectTable(item.reservationID,item);
      }
    });
  }

  autoSeatParty(item: any) {
    let model = new SeatPartyModel();
    model.id = item.reservationID;
    model.tableID = item.suggestedTableID;
    model.clientID = this.shared.getClientID();
    model.seatedTime = this.tzone.getClientTimeWithCTZone(new Date());
    this.shared.seatReservationParty(model).subscribe(
      data => {
        this.update.updateReservations(true);
        this.alertService.success("Party seated successfully.");
        this.dialogRef.close(true);
      },
      error => {
        this.alertService.error(error.error.message);
      }
    );
  }
  getTableDetails(reservation: any) {
    this.shared.getTableDetails(reservation.suggestedTableID, this.shared.getClientID()).subscribe(
      data => {
        this.tableDetails = data;
        this.checkPartyCovers(reservation, this.tableDetails.covers)
      })
  }
  
  checkPartyCovers(reservation: any, totalcovers: number) {
    if ((reservation.adultCovers + reservation.childCovers) > totalcovers) {
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
          this.autoSeatParty(reservation) 
        }
      });
    }
    else {
      this.autoSeatParty(reservation);
    }
  }
 
  selectTable(reservationID,reservationData) {
    let dialogRef = this.dialog.open(SelectTableComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { item:reservationData,ID: reservationID, type: "seat-reservation" }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close();
        this.update.updateReservations(true);
      }
    });
  }

  //suggest table
  suggestTable(reservationID: string) {
    let dialogRef = this.dialog.open(SelectTableComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        item:this.data.guestModel,
        ID: reservationID,
        type: "suggest-reservation",
        guestModel: this.data.guestModel
      }
    });
    this.dialogRef.close(true);
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.id) {
        this.update.updateReservations(true);
        this.dialogRef.close(true);
      }
    });
  }
  checkEmptyString() {
    var result = this.message.messageText.trim().length == 0 ? false : true;
    return result;
  }
}
