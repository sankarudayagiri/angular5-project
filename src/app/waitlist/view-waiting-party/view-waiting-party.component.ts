import {
  Component,
  OnInit,
  Inject,
  Input,
  ViewChild
} from "@angular/core";
import {
  AlertService,
  LoaderService,
  SharedDataService,
  DiscardDialogService,
  ModuleStatus,
  InitializeService,
  TimeZoneService
} from "../../_services/index";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material";
import { GuestDetailModel } from "../../_services";
import {
  WaitlistService,
  ChangeWaitlistModel,
  PartyConfirm,
  guestMessage,
  SeatPartyModel
} from "../waitlist.service";
import * as _ from "underscore";
import { ConfirmDialog, ViewTabsComponent } from "../../shared";
import { WaitlistAddViewEditDialog } from "../add-view-edit-dialog.component";
import { UpdateResultsService } from "../../_services/update-results.service";
import { SelectTableComponent } from "../../shared/select-table/select-table.component";

export class UserInfo {
  adultCovers: number = 0;
  childCovers: number = 0;
  guest: { id: ""; name: null; phone: 0 };
  total: number = 0;
  notes = { customNotes: null, notes: null };
  priority: object = { id: null, description: null };
  totalNotes: any;
  reservationID: number = 0;
  createdDate: Date;
  visitHistory: any;
  isFromReservation: boolean;
}

@Component({
  selector: "view-waiting-party",
  templateUrl: "./view-waiting-party.component.html",
  styleUrls: ["./view-waiting-party.component.scss"],
  providers: [WaitlistService]
})
export class ViewWaitingPartyComponent implements OnInit {
  guestModel: GuestDetailModel = new GuestDetailModel();
  guestChangeModel: ChangeWaitlistModel = new ChangeWaitlistModel();
  showWaitlist: boolean = false;

  @Input()
  type: any;
  priority: number = 3;
  userDetails: UserInfo = new UserInfo();
  message: guestMessage = new guestMessage();
  guestId: string = "";
  partyData: PartyConfirm = new PartyConfirm();
  percentage: number;
  //waitlistModel: WaitlistModel = new WaitlistModel();
  expectedEndTime: Date;
  spentTime: number;
  quotedTime: number;
  tab: boolean = true;
  medPriority: boolean = false;
  highPriority: boolean = false;
  items: any[] = [];
  textMessageCount: number;
  @ViewChild(ViewTabsComponent)
  private ViewTabsComponent: ViewTabsComponent;
  modules : ModuleStatus = new ModuleStatus;
  tableDetails:any
  constructor(
    private alertService: AlertService,
    private loaderService: LoaderService,
    private waitlistService: WaitlistService,
    private shared: SharedDataService,
    public initialize : InitializeService,
    public discard: DiscardDialogService,
    public dialogRef: MatDialogRef<WaitlistAddViewEditDialog>,
    public dialog: MatDialog,
    private update: UpdateResultsService,
    public tzone: TimeZoneService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.loaderService.showLoader(true);
  }

  ngOnInit() {
    this.getWaitListData();
    // this.percentage = Math.round(this.data.waitparty.percent);
    this.modules = this.initialize.returnModuleStatus();
  }


  getExpectedEndTime() {
    let date = new Date(this.data.guestModel.createdDate);
    let time: string = this.data.guestModel.quotedWaitTime;
    let parts = time.match(/(\d+):(\d+)/);
    if (parts) {
      let hours = parseInt(parts[1]),
        minutes = parseInt(parts[2]);
      date = new Date(
        date.setHours(date.getHours() + hours, date.getMinutes() + minutes)
      );
    }
    return date;
  }

  getWaitListData() {
    this.waitlistService
      .getWaitlistData(this.data.id, this.shared.getClientID())
      .subscribe(
        data => {
          if(data.isFromReservation){
            data.waitListType.description = "Walk-in";
            data.waitListType.id = 1;
          }
          this.userDetails = data;
          this.data.guestModel = data;
          this.textMessageCount = data.textMessages.length;
          this.expectedEndTime = this.getExpectedEndTime();
          this.medPriority = data.priority.id == 2 ? true : false;
          this.highPriority = data.priority.id == 1 ? true : false;
        },
        error => { }
      );
  }

  editWaitlist() {
    let model = this.data.guestModel;
    model.waitListID = this.data.waitListID;
    model.priorityID = this.medPriority ? 2 : this.highPriority ? 1 : 3;
    model.waitListTypeID = this.data.guestModel.waitListType.id;
    model.notesToAdd = this.selectedNotes();
    model.customNotes = this.data.guestModel.notes.customNotes == "" ? null : this.data.guestModel.notes.customNotes;
    model.clientID = this.shared.getClientID();
    model.waitListDataID = this.data.id;
    model.pagerNumber = model.pagerNumber == 0 ? null : model.pagerNumber;
    delete model.priority;
    this.waitlistService.editWaitlist(model).subscribe(
      data => {
        this.showWaitlist = false;
        this.update.updateWaitlist(true);
        this.alertService.success("Party details updated successfully");
        this.dialogRef.close(true);
      },
      error => {
        this.alertService.error(error.error.message);
      }
    );
  }

  selectedNotes() {
    let notes = _.pluck(_.where(this.data.guestModel.notes.notes), "id");
    notes = notes.filter(function (n) {
      return n != undefined;
    });
    return notes;
  }

  messageSend() {
    this.getWaitListData();
    if (this.textMessageCount < 2) {
      this.sendMessage();
    }
    else {
      let dialogRef = this.dialog.open(ConfirmDialog, {
        width: "355px",
        disableClose: true,
        data: {
          button: "CONFIRM",
          type: "danger",
          cancelBtn: true,
          message:"Party <span class='text-capitalize'> "
          +this.userDetails.guest.name+
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
    this.message.waitListDataID = this.data.id;
    this.message.clientID = this.shared.getClientID();
    this.waitlistService.postWaitListTextMessage(this.message).subscribe(
      data => {
        this.loaderService.showLoader(false);
        this.message.messageText = "";
        this.alertService.success("Message sent Successfully.");
        this.ViewTabsComponent.getTextMessage();
        this.update.updateWaitlist(true);
      },
      error => {
        this.loaderService.showLoader(false);
        this.alertService.error(error.error.message);
      }
    );
  }

  // seat party from the wait list
  seatParty(waitListDataID: string, waitListTypeID: number, wait: any): void {
    let modules: ModuleStatus = this.initialize.returnModuleStatus();
    if (!modules.hasModuleTable) {
      if(waitListTypeID == 1){
        this.movePartyToHistory(waitListDataID);
      }
      else{
        this.confirmArrival(waitListDataID,wait,"NoModuleTable");
      }
    } 
   else if (wait.suggestedTableID) {
      this.autoSeatPartyConfirm(wait);
    } else {
      if (waitListTypeID == 1) {
        this.selectTable(waitListDataID, "seat-waitlist",wait);
      } else {
        this.confirmArrival(waitListDataID,wait,"hasModuleTable");

      }
    }
  }

movePartyToHistory(waitListDataID: string) {
  this.waitlistService
    .movePartyToHistory(waitListDataID, this.shared.getClientID())
    .subscribe(
      data => {
        this.alertService.success("Party seated successfully.");
        this.dialogRef.close();
        this.update.updateFloorPlan(true);
        this.update.updateWaitlist(true);
      },
      error => {
        this.alertService.error(error.error.message);
      }
    );
}

  autoSeatPartyConfirm(wait: any) {
    let msg;
    msg =
      "Seat Party <span class='text-capitalize'>" +
      wait.guest.description +
      " </span> at table " +
      wait.suggestedTableName +
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
        // this.autoSeatParty(wait);
        this.getTableDetails(wait);
      } else if (result == "optional") {
        this.selectTable(wait.waitListDataID, "seat-waitlist",wait);
      }
    });
  }

  autoSeatParty(wait: any) {
    let model = new SeatPartyModel();
    model.id = wait.waitListDataID;
    model.tableID = wait.suggestedTableID;
    model.clientID = this.shared.getClientID();
    model.seatedTime = this.tzone.getClientTimeWithCTZone(new Date());
    this.shared.seatWaitListParty(model).subscribe(
      data => {
        this.alertService.success("Party seated successfully.");
        this.dialogRef.close();
        this.update.updateWaitlist(true);
      },
      error => {
        this.alertService.error(error.error.message);
      }
    );
  }
  getTableDetails(waitlist: any) {
    this.shared.getTableDetails(waitlist.suggestedTableID, this.shared.getClientID()).subscribe(
      data => {
        this.tableDetails = data;
        this.checkPartyCovers(waitlist, this.tableDetails.covers)
      })
  }
  
  checkPartyCovers(waitlist: any, totalcovers: number) {
    if ((waitlist.adultCovers + waitlist.childCovers) > totalcovers) {
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
          this.autoSeatParty(waitlist) 
        }
      });
    }
    else {
      this.autoSeatParty(waitlist);
    }
  }

  selectedTabChange(tabSelected) {
    this.tab = tabSelected == "history" ? false : true;
  }

  selectTable(waitListDataID, suggestedTableID,wait) {
    let dialogRef = this.dialog.open(SelectTableComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        item:wait,
        ID: waitListDataID,
        type: "seat-waitlist",
        suggestedTableID: suggestedTableID
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.update.updateWaitlist(true);
        this.dialogRef.close();
      }
    });
  }

  confirmArrival(waitListDataID: string,wait:any,type:string) {
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
        if( type=="hasModuleTable"  ){
          this.selectTable(waitListDataID, null,wait);
          this.partyArrive(waitListDataID);
        }
        else{
          this.movePartyToHistory(waitListDataID);
        }
       
      }
    });
  }

  partyArrive(waitListDataID: string) {
    this.partyData.clientID = this.shared.getClientID();
    this.partyData.waitListDataID = waitListDataID;
    this.waitlistService.waitListDataConfirm(this.partyData).subscribe(
      data => {
        this.update.updateWaitlist(true);
        this.alertService.success("Party is confirmed");
      },
      error => {
        this.alertService.error(error.errors.message);
      }
    );
  }

  partyArrived() {
    this.partyData.clientID = this.shared.getClientID();
    this.partyData.waitListDataID = this.data.id;
    this.waitlistService.waitListDataConfirm(this.partyData).subscribe(
      data => {
        this.loaderService.showLoader(false);
        this.priority = 1;
        this.data.waitparty.waitListType.id = 1;
        this.update.updateWaitlist(true);
        this.alertService.success("Party is confirmed");
      },
      error => {
        this.loaderService.showLoader(false);
        this.alertService.error(error.errors.message);
      }
    );
  }

  editparty() {
    this.data.type = 2;
  }

  noShow() {
    this.waitlistService
      .noshow(this.data.id, this.shared.getClientID())
      .subscribe(
        data => {
          this.update.updateWaitlist(true);
          this.alertService.success("Party moved to No-Show successfully.");
          this.dialogRef.close(true);
        },
        error => { }
      );
  }

  deleteWaitlistData() {
    this.waitlistService
      .deleteWaitlistData(this.data.id, this.shared.getClientID())
      .subscribe(
        data => {
          this.update.updateWaitlist(true);
          this.dialogRef.close(true);
        },
        error => { }
      );
  }

  confirmDelete() {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "Confirm",
        type: "danger",
        cancelBtn: true,
        message:
          "Remove <span class='text-uppercase'>" +
          this.data.guestModel.guest.name + "</span> from this Wait List? This operation cannot be undone."
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.deleteWaitlistData();
    });
  }

  confirmNoShow() {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "Yes",
        type: "danger",
        cancelBtn: true,
        message: "Guest <span class='text-uppercase'>" +
          this.data.guestModel.guest.name +
          "</span> is no-show?"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.noShow();
    });
  }

  confirmPartyArrival(party: any) {
    let message =
      "Guest <span class='font-weight-bold text-uppercase'>" +
      party.guest.name +
      " </span>has arrived? This operation cannot be undone.";
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "CONFIRM",
        type: "danger",
        message: message
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.partyArrived();
    });
  }

  //suggest table
  suggestTable(waitListDataID: string) {
    let dialogRef = this.dialog.open(SelectTableComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        item:this.data.guestModel,
        ID: waitListDataID,
        type: "suggest-waitlist"
      }
    });
    this.dialogRef.close(true);
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.id) {
        this.update.updateWaitlist(true);
        this.dialogRef.close(true);
      }
    });
  }
  checkEmptyString() {
    var result = this.message.messageText.trim().length == 0 ?
      false :
      true
    return result;
  }
}
