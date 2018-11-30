import { Component, OnInit } from "@angular/core";
import {
  SharedDataService,
  ModuleStatus,
  InitializeService,
  TimeZoneService,
  UpdateResultsService,
  AlertService
} from "../../_services";
import { FormControl } from "@angular/forms";
import {
  ReservationData,
  ReservationCount,
  DashBoardService
} from "../dashboard.service";
import { ConfirmDialog } from "../../shared";
import { MatDialog } from "@angular/material";
import { ReservationsStatusModel } from "../../reservation/reservation.component";
import { ReservationService } from "../../reservation/reservation.service";
import { User } from "../../_models";
import { AuthenticationService } from "../../authentication/authentication.service";
import { Subscription } from "rxjs";

export class TotalReservationCount {
  totalCovers: number = 0;
  totalParties: number = 0;
}

@Component({
  selector: "widget-reservation",
  templateUrl: "widget-reservation.component.html",
  styleUrls: ["widget-reservation.component.scss"]
})
export class WidgetReservationComponent implements OnInit {
  public currentUser: User;
  public reservationDate = new FormControl(new Date());
  public reservations: any[] = [];
  public reservationData: ReservationData = new ReservationData();
  public selectedReservationTab: number = 15;
  public reservationCount: ReservationCount = new ReservationCount();
  public totalReservationCount: TotalReservationCount = new TotalReservationCount();
  public storedReservations: any[] = [];
  public reservationHeaderDetail: any;
  public blockReservationsStaus: boolean;
  public partyCount: boolean = true;
  public availableReservation: any;
  public scrollReachedBottom: boolean = false;
  public noReservationResults: boolean = true;

  public reservationLoading: boolean;
  public modules: ModuleStatus = new ModuleStatus();
  private updateReservationsSubscription: Subscription;

  constructor(
    private dashBoardService: DashBoardService,
    private shared: SharedDataService,
    private initialize: InitializeService,
    private tzone: TimeZoneService,
    public update: UpdateResultsService,
    private dialog: MatDialog,
    public reservationService: ReservationService,
    private alert: AlertService,
    private authenticate: AuthenticationService
  ) {
    this.currentUser = this.authenticate.getUser();
    this.reservationDate = new FormControl(
      this.tzone.getClientDateTimeWithLTZone(new Date())
    );

    this.updateReservationsSubscription = update.updateReservation$.subscribe(
      () => {
        this.reservations = [];
        this.getReservationList(this.reservationData.intervalMinutes);
        this.getTotalReservationCount();
      }
    );
  }

  ngOnInit() {
    this.modules = this.initialize.returnModuleStatus();
    this.getReservationList(15);
    this.getTotalReservationCount();
    this.getBlockedReservationsStatus();
  }

  onSelectedReservationHeaderTab(interval) {
    this.selectedReservationTab = interval;
    this.reservations = [];
    this.reservationData.intervalMinutes = interval;
    this.getReservationList(this.reservationData.intervalMinutes);
  }

  //get total party count
  getTotalReservationCount() {
    let date = new Date(
      JSON.parse(
        JSON.stringify(this.tzone.getClientDateTimeWithLTZone(new Date()))
      )
    ),
      fromDate = new Date(date.setHours(0, 0, 0, 0)),
      toDate = new Date(date.setHours(24, 0, 0, 0));
    this.reservationCount.fromDate = this.tzone.getLocalTimeWithCTZone(
      fromDate
    );
    this.reservationCount.toDate = this.tzone.getLocalTimeWithCTZone(toDate);
    this.reservationCount.clientID = this.shared.getClientID();
    this.dashBoardService
      .totalReservationCount(this.reservationCount)
      .subscribe(data => {
        this.totalReservationCount = data;
      });
  }

  // get reservation list
  getReservationList(interval) {
    this.reservationLoading = true;
    let today = this.tzone.getClientDateTimeWithLTZone(new Date());
    let date = new Date(
      JSON.parse(
        JSON.stringify(this.tzone.getClientDateTimeWithLTZone(new Date()))
      )
    ),
      fromDate = today,
      toDate = new Date(date.setHours(24, 0, 0, 0));
    this.reservationData.fromDate = this.tzone.getLocalTimeWithCTZone(fromDate);
    this.reservationData.toDate = this.tzone.getLocalTimeWithCTZone(toDate);
    this.reservationData.dateToGetAvailableReservations = this.tzone.getLocalTimeWithCTZone(fromDate);
    this.reservationData.clientID = this.shared.getClientID();
    this.reservationData.intervalMinutes = interval;
    this.dashBoardService.reservation(this.reservationData).subscribe(
      data => {
        this.reservationLoading = false;
        this.reservationHeaderDetail = data.headerDetail;
        this.partyCount =
          this.reservationHeaderDetail[0].totalCount > 0 ||
            this.reservationHeaderDetail[1].totalCount > 0 ||
            this.reservationHeaderDetail[2].totalCount > 0 ||
            data.reservations.length == 0
            ? true
            : false;
        if (interval == 60 && data.reservationsByInterval[2].length > 0) {
          this.reservations.push(data.reservationsByInterval[2]);
        } else if (
          interval == 30 &&
          data.reservationsByInterval[1].length > 0
        ) {
          this.reservations.push(data.reservationsByInterval[1]);
        } else {
          var array =
            data.reservationsByInterval[0].length > 0
              ? data.reservationsByInterval[0]
              : data.reservationsByInterval[1].length > 0
                ? data.reservationsByInterval[1]
                : data.reservationsByInterval[2].length > 0
                  ? data.reservationsByInterval[2]
                  : data.reservations;
          this.reservations.push(array);
          this.selectedReservationTab =
            this.reservationHeaderDetail[0].totalCount != 0
              ? 15
              : this.reservationHeaderDetail[1].totalCount != 0
                ? 30
                : 60;
        }

        this.availableReservation = data.availableReservations;
      },
      error => { }
    );
  }

  getNextReservationSet() {
    this.getReservationList(this.reservationData.intervalMinutes);
  }

  confirmForBlockUnBlock(type) {
    //let date = this.datePipe.transform(this.reservationDate.value, "MMMM d, y");
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

  // clear subscription on destroy
  ngOnDestroy() {
    this.updateReservationsSubscription.unsubscribe();
  }
}
