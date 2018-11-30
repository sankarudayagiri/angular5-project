import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MatDialog, MatSnackBar } from "@angular/material";
import { WaitlistAddViewEditDialog } from "../add-view-edit-dialog.component";
import {
  WaitlistService,
  SendMessage,
  PartyConfirm,
  guestMessage,
  SeatPartyModel
} from "../waitlist.service";
import {
  LoaderService,
  SharedDataService,
  AlertService,
  TimeZoneService,
  ModuleStatus,
  InitializeService
} from "../../_services";
import { ConfirmDialog } from "../../shared";
import { UpdateResultsService } from "../../_services/update-results.service";
import { SelectTableComponent } from "../../shared/select-table/select-table.component";
import { ScrollEvent } from "ngx-scroll-event";
import { User } from "../../_models";
@Component({
  selector: "wait-list-items",
  templateUrl: "./wait-list-items.component.html",
  styleUrls: ["./wait-list-items.component.scss"],
  providers: [WaitlistService]
})
export class WaitListItemsComponent {
  @Input()
  waitlistData: any;
  @Input()
  parent: string = null;
  @Input()
  type: number;
  @Input()
  waitlistName: string;
  @Input()
  textMessageCount;
  @Input()
  noResults: boolean;
  @Input()
  tableID: string;
  @Input()
  scrollReachedBottom: boolean = false;
  @Output()
  scrollReachedBottomChange: EventEmitter<boolean> = new EventEmitter();
  @Input()
  showInterval;
  waitlistDate: Date = new Date();
  message: guestMessage = new guestMessage();
  currentUser: User;
  animation: boolean = false;
  sendmessage: SendMessage = new SendMessage();
  partyData: PartyConfirm = new PartyConfirm();
  tableDetails: any;
  constructor(
    public dialog: MatDialog,
    private waitlistService: WaitlistService,
    private shared: SharedDataService,
    public initialize: InitializeService,
    public tzone: TimeZoneService,
    public snackBar: MatSnackBar,
    private update: UpdateResultsService,
    public alert: AlertService
  ) { }

  ngOnInit() { }

  ngOnChanges(changes) {
    if (changes && changes.waitlistData) {
      this.scrollReachedBottom = false;
      if (this.parent != "tables") {
        this.waitlistData = [this.waitlistData];
      }
    }
    if (changes && changes.waitlistName)
      this.waitlistName = changes.waitlistName.currentValue;
  }

  viewWaitingParty(
    waitListDataID: string,
    waitListID: string,
    waitparty: number
  ): void {
    let dialogRef = this.dialog.open(WaitlistAddViewEditDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        type: 1,
        id: waitListDataID,
        waitListID: waitListID,
        waitparty: waitparty
      }
    });

    dialogRef.afterClosed().subscribe(result => { });
  }

  seatParty(waitListDataID: string, waitListTypeID: number, wait: any): void {
    let modules: ModuleStatus = this.initialize.returnModuleStatus();
    if (!modules.hasModuleTable) {
      if (waitListTypeID == 1) {
        this.movePartyToHistory(waitListDataID);
      }
      else {
        this.confirmArrival(waitListDataID, wait, "NoModuleTable");
      }
    } else if (this.tableID) {
      this.getTableDetails(wait, this.tableID)
      // this.autoSeatParty(wait, this.tableID);
    } else if (wait.suggestedTableID) {
      this.autoSeatPartyConfirm(wait);
    } else {
      if (waitListTypeID == 1) {
        this.selectTable(waitListDataID, "seat-waitlist", wait);
      } else {
        this.confirmArrival(waitListDataID, wait, "hasModuleTable");
      }
    }
  }

  movePartyToHistory(waitListDataID: string) {
    this.waitlistService
      .movePartyToHistory(waitListDataID, this.shared.getClientID())
      .subscribe(
        data => {
          this.alert.success("Party seated successfully.");
          this.update.updateWaitlist(true);
        },
        error => {
          this.alert.error(error.error.message);
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
        this.getTableDetails(wait, wait.suggestedTableID)
        // this.autoSeatParty(wait, wait.suggestedTableID);
      } else if (result == "optional") {
        this.selectTable(wait.waitListDataID, "seat-waitlist", wait);
      }
    });
  }

  autoSeatParty(wait: any, tableID: string) {
    let model = new SeatPartyModel();
    model.id = wait.waitListDataID;
    model.tableID = tableID;
    model.clientID = this.shared.getClientID();
    model.seatedTime = this.tzone.getClientTimeWithCTZone(new Date());
    this.shared.seatWaitListParty(model).subscribe(
      data => {
        this.alert.success("Party seated successfully.");
        this.update.updateFloorPlan(true);
        this.update.updateWaitlist(true);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  getTableDetails(wait: any, tableId) {
    this.shared.getTableDetails(tableId, this.shared.getClientID()).subscribe(
      data => {
        this.tableDetails = data;
        this.checkPartyCovers(wait, this.tableDetails.covers, tableId)
      })
  }

  checkPartyCovers(wait: any, totalcovers: number, tableId) {
    if ((wait.adultCovers + wait.childCovers) > totalcovers) {
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
          this.autoSeatParty(wait, tableId)
        }
      });
    }
    else {
      this.autoSeatParty(wait, tableId);
    }
  }

  selectTable(waitListDataID: string, type: string, wait: any) {
    let dialogRef = this.dialog.open(SelectTableComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        item: wait,
        ID: waitListDataID,
        type: type
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result && result.id) {
          this.updateSuggestedTable(waitListDataID, result.id);
        } else {
          this.update.updateWaitlist(true);
        }
      }
    });
  }

  confirmArrival(waitListDataId: string, wait: any, type: string) {
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
          this.selectTable(waitListDataId, "seat-waitlist", wait);
          this.partyArrived(waitListDataId);
        }
        else {
          this.movePartyToHistory(waitListDataId);
        }
      }
    });
  }

  partyArrived(waitListDataId: string) {
    this.partyData.clientID = this.shared.getClientID();
    this.partyData.waitListDataID = waitListDataId;
    this.waitlistService.waitListDataConfirm(this.partyData).subscribe(
      data => {
        this.update.updateWaitlist(true);
        this.alert.success("Party is confirmed");
      },
      error => {
        this.alert.error(error.errors.message);
      }
    );
  }

  //undo no-show
  undoNoShow(waitListDataHistoryID: string) {
    this.waitlistService
      .undoNoShow(waitListDataHistoryID, this.shared.getClientID())
      .subscribe(
        data => {
          this.alert.success("Successfully Added Party back to Wait List");
          this.update.updateWaitlist(true);
        },
        error => { }
      );
  }

  confirmUndoNoShow(waitListDataHistoryID: string, waitListName: string) {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "CONFIRM",
        type: "danger",
        cancelBtn: true,
        message:
          "Restore this party to Wait List <span class='text-uppercase'>" +
          waitListName +
          "</span>?"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.undoNoShow(waitListDataHistoryID);
    });
  }

  sendMessageToPhone(wait: any, suggestedTableID: string, waitListDataID: string, messageText: string ) {
    let modules: ModuleStatus = this.initialize.returnModuleStatus();
    if (suggestedTableID || !modules.hasModuleTable) {
      this.alert.info("Paging to Mobile Number");
      this.message.waitListDataID = waitListDataID;
      this.message.clientID = this.shared.getClientID();
      this.message.saveMessage = true;
      this.message.messageText = messageText;
      console.log(this.message)
      this.waitlistService.postWaitListTextMessage(this.message).subscribe(
        data => {
          this.alert.success("Paged Successfully.");
        },
        error => {
          // this.alert.error(error.errors.message);
        }
      );
    } else {
      this.selectTable(waitListDataID, "suggest-waitlist", wait);
    }
  }

  sendMessageToPager(wait: any,
    pager: string,
    suggestedTableID: string,
    waitListDataID: string
  ) {
    if (suggestedTableID) {
      this.alert.info("Paging... #" + pager);
      this.sendmessage.pagerNumber = pager;
      this.sendmessage.clientID = this.shared.getClientID();
      this.sendmessage.waitListDataID = waitListDataID;
      this.waitlistService.sendMessageToPager(this.sendmessage).subscribe(
        data => { },
        error => {
          this.alert.error(error.error.errors[0].message);
        }
      );
    } else {
      this.selectTable(waitListDataID, "suggest-waitlist", wait);
    }
  }

  updateSuggestedTable(waitListDataID, suggestedTableID) {
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
