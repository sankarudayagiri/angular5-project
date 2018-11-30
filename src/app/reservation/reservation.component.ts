import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import * as _ from "underscore";

import {
  ReservationService,
  timeSlot,
  GetReservationListModel,
  ReservationHistory,
  ReservationModel
} from "../reservation/reservation.service";
import { MatDialog } from "@angular/material";
import { AddViewEditDialog } from "./add-view-edit-dialog.component";
import {
  SharedDataService,
  AlertService,
  LoaderService,
  UpdateResultsService,
  TimeZoneService
} from "../_services";
import { ConfirmDialog } from "../shared";
import { Subscription } from "rxjs";
import { User } from "../_models";
import { AuthenticationService } from "../authentication/authentication.service";

export class ReservationsStatusModel {
  clientID: string;
  blockedDate: string;
}

@Component({
  templateUrl: "reservation.component.html",
  styleUrls: ["reservation.component.scss"]
})
export class ReservationComponent implements OnInit {
  date = new FormControl(new Date());
  timeSlots: timeSlot[] = [];
  ReservationHeaderId: any;
  getReservationListModel: GetReservationListModel = new GetReservationListModel();
  selectedDate: Date = new Date();
  reservationDate = new FormControl(new Date());
  showReservationTab: boolean = true;
  headerDetail: any;
  partiesGuestNumber: any = [];
  selectedTab: any = 1;
  totalListParties: number = 0;
  totalListGuests: number = 0;
  reservationHistory: ReservationHistory = new ReservationHistory();
  searchResult: boolean = true;
  reservations: ReservationModel = new ReservationModel();
  blockReservationsStaus: boolean;
  groupedReservationsList: any[] = [];
  selectedTime: Date;
  previousDate: boolean = false;
  today: boolean = true;
  scrollReachedBottom: boolean = false;
  storedReservations: any[] = [];
  noResults: boolean = true;
  currentUser: User;
  noSlotsError: boolean;
  textMessageCount: any[] = [];
  searchReservationModel: string;
  dateTime: string;
  timezone: string;
  timeSoltCount: number;
  private updateReservationsSubscription: Subscription;

  constructor(
    private reservationService: ReservationService,
    private loaderService: LoaderService,
    public dialog: MatDialog,
    public alert: AlertService,
    private shared: SharedDataService,
    public tzone : TimeZoneService,
    private update: UpdateResultsService,
    private authenticate : AuthenticationService
  ) {
    this.timezone = this.tzone.getSavedClientTimeZone();
    this.reservationDate = new FormControl(
      this.tzone.getClientDateTimeWithLTZone(new Date())
    );
    this.date = new FormControl(
      this.tzone.getClientDateTimeWithLTZone(new Date())
    );
    this.currentUser = this.authenticate.getUser();
    this.loaderService.showLoader(true);

    this.updateReservationsSubscription = update.updateReservation$.subscribe(
      update => {
        this.clearFilters();
        this.selectedTab != 1 && this.getHistory(this.selectedTab);
        this.selectedTab == 1 && this.getReservationList();
      }
    );
  }

  ngOnInit() {
    this.getReservationList();
    this.getBlockedReservationsStatus();
  }

  // ============== update results on tab selecetion
  onSelectTab(tab: any) {
    this.reservationHistory.nameOrPhone = "";
    this.getReservationListModel.nameOrPhone = "";
    this.searchReservationModel = "";
    let t = tab;
    if (t != this.selectedTab || !this.searchResult) {
      this.clearFilters();
      tab != 1 && this.getHistory(t);
      tab == 1 && this.getReservationList();
    }
    this.selectedTab = tab;
  }

  clearFilters() {
    this.getReservationListModel.pageNumber = 1;
    this.reservationHistory.pageNumber = 1;
    this.storedReservations = [];
    this.ReservationHeaderId = null;
    this.loaderService.showLoader(true);
  }

  getBlockedReservationsStatus() {
    let date = new Date(JSON.parse(JSON.stringify(this.reservationDate.value)));
    let stringdate = this.tzone.getLocalTimeWithCTZone(date);
    let model = new ReservationsStatusModel();
    model.clientID = this.shared.getClientID();
    model.blockedDate = stringdate;
    this.reservationService.getBlockedReservationsStatus(model).subscribe(
      data => {
        this.blockReservationsStaus = data;
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  onSelectedHeaderTab(HeaderId: any) {
    this.ReservationHeaderId = HeaderId;
    this.loaderService.showLoader(true);
    this.getReservationListModel.pageNumber = 1;
    this.storedReservations = [];
    this.getReservationList();
  }

  // ==============changing dates
  updateOnDateChange(date) {
    let d = this.tzone.getClientDateTimeWithLTZone(new Date()),
      s = new Date(date.value);
    this.reservationDate = date;
    this.previousDate =
      d.getDate() > s.getDate() && d.getMonth() >= s.getMonth();
    this.today = d.getDate() == s.getDate() && d.getMonth() == s.getMonth();
    this.clearFilters();
    this.getBlockedReservationsStatus();
    this.selectedTab != 1 && this.getHistory(this.selectedTab);
    this.selectedTab == 1 && this.getReservationList();
  }

  getNextSet(event) {
    this.getReservationList();
  }

  searchReservation = _.debounce(function () {
    this.updateSearch(this.searchReservationModel);
  }, 500);

  updateSearch(event: string) {
    this.searchResult = false;
    this.clearFilters();
    if (event == "") {
      this.searchResult = true;
    }
    if (this.selectedTab != 1) {
      this.reservationHistory.nameOrPhone = event;
      this.getHistory(this.selectedTab);
    } else {
      this.getReservationListModel.nameOrPhone = event;
      this.getReservationList();
    }
  }

  //to hide add reservation button when no timeslots
  noSlots(error) {
    this.noSlotsError = error;
  }

  count(count) {
    this.timeSoltCount= count
  }
  
  // ==============addParty dialog
  addParty(): void {
    let dialogRef = this.dialog.open(AddViewEditDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        type: 0,
        view: "add",
        date: this.reservationDate,
        time: this.selectedTime,
        count:this.timeSoltCount
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedTab = 1;
        this.getReservationListModel.pageNumber = 1;
        this.storedReservations = [];
        this.getReservationList();
      }
    });
  }

  //   // ============== get reservation list
  getReservationList() {
    let date = new Date(JSON.parse(JSON.stringify(this.reservationDate.value))),
      fromDate = new Date(date.setHours(0, 0, 0, 0)),
      toDate = new Date(date.setHours(24, 0, 0, 0));
    this.getReservationListModel.fromDate = this.tzone.getLocalTimeWithCTZone(
      fromDate
    );
    this.getReservationListModel.toDate = this.tzone.getLocalTimeWithCTZone(
      toDate
    );
    this.getReservationListModel.clientID = this.shared.getClientID();
    this.getReservationListModel.totalCovers = this.ReservationHeaderId;
    this.reservationService
      .getReservationList(this.getReservationListModel)
      .subscribe(
        data => {
          this.showReservationTab = true;
          this.loaderService.showLoader(false);
          if (!this.ReservationHeaderId) {
            this.totalListParties = data.totalParites;
            this.totalListGuests = data.totalCovers;
          }
          this.noResults =
            data.reservations.items.length > 0 &&
              data.reservations.totalRecords >
              this.getReservationListModel.pageSize
              ? false
              : true;
          //this.reservations = data.reservations.items;

          if (this.searchResult) {
            this.partiesGuestNumber = data;
          }
          this.headerDetail = data.headerDetail;
          this.headerDetail = _.sortBy(this.headerDetail, function (
            reservation
          ) {
            return reservation.numberOfTop;
          });
          let newList = _.sortBy(data.reservations.items, function (
            reservation
          ) {
            return reservation.reservationTime;
          });
          this.storedReservations = this.storedReservations.concat(newList);
          this.reservations = this.getGroupedlist(this.storedReservations);
          this.getReservationListModel.pageNumber =
            this.getReservationListModel.pageNumber + 1;
          this.selectedTime = null;
        },
        error => {
          this.loaderService.showLoader(false);
        }
      );
    //this.reservationDate = new FormControl(new Date());
  }

  getGroupedlist(data) {
    let list = _.toArray(_.groupBy(data, "reservationTime"));
    return list;
  }

  // ============== get reservation history
  getHistory(tab) {
    let date = new Date(JSON.parse(JSON.stringify(this.reservationDate.value))),
      fromDate = new Date(date.setHours(0, 0, 0, 0)),
      toDate = new Date(date.setHours(24, 0, 0, 0));
    this.reservationHistory.fromDate = this.tzone.getLocalTimeWithCTZone(
      fromDate
    );
    this.reservationHistory.toDate = this.tzone.getLocalTimeWithCTZone(toDate);

    this.reservationHistory.clientID = this.shared.getClientID();
    this.reservationHistory.statusIDs = [];
    this.reservationHistory.statusIDs.push(tab);
    this.reservationService
      .postReservationHistory(this.reservationHistory)
      .subscribe(
        data => {
          if (this.searchResult) {
            this.partiesGuestNumber = data;
          }
          this.noResults =
            data.reservations.items.length > 0 &&
              data.reservations.totalRecords > this.reservationHistory.pageSize
              ? false
              : true;
          this.textMessageCount = data.textMessageCount;
          this.loaderService.showLoader(false);
          let newList = data.reservations.items;
          this.storedReservations = this.storedReservations.concat(newList);
          this.reservations = this.getGroupedlist(this.storedReservations);
          this.reservationHistory.pageNumber =
            this.reservationHistory.pageNumber + 1;
        },
        error => {
          this.loaderService.showLoader(false);
        }
      );
  }

  confirmForBlockUnBlock(type) {
    let message =
      type == "block"
        ? "Stop Reservations for Today?"
        : "Unblock Reservations for Today?";
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "Confirm",
        type: "danger",
        message: message
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (type == "block") {
          this.stopReservationsForToday();
        } else {
          this.unBlockReservations();
        }
      }
    });
  }

  stopReservationsForToday() {
    let date = new Date(JSON.parse(JSON.stringify(this.reservationDate.value)));
    let stringdate = this.tzone.getLocalTimeWithCTZone(date);
    let model = new ReservationsStatusModel();
    model.clientID = this.shared.getClientID();
    model.blockedDate = stringdate;
    this.reservationService.stopReservationForToday(model).subscribe(
      data => {
        this.blockReservationsStaus = true;
        this.alert.success("Successfully Blocked Reservations for Today");
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  unBlockReservations() {
    let date = new Date(JSON.parse(JSON.stringify(this.reservationDate.value)));
    let stringdate = this.tzone.getLocalTimeWithCTZone(date);
    let model = new ReservationsStatusModel();
    model.clientID = this.shared.getClientID();
    model.blockedDate = stringdate;
    this.reservationService.unblockReservation(model).subscribe(
      data => {
        this.blockReservationsStaus = false;
        this.alert.success("Successfully Unblocked Reservations for Today");
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  // clear subscription on destroy
  ngOnDestroy() {
    this.updateReservationsSubscription.unsubscribe();
  }
}
