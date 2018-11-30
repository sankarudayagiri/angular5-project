import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material";
import {
  SharedDataService,
  AlertService,
  TimeZoneService,
  ModuleStatus,
  InitializeService
} from "../../_services";
import { UpdateResultsService } from "../../_services/update-results.service";
import {
  TableService,
  WaitListStats,
  ReservationStats
} from "../tables.service";
import { Table } from "../../admin/floor-plan/floor-plan.service";
import * as _ from "underscore";
import {
  GetWaitlistModel,
  WaitlistService,
  SortingList
} from "../../waitlist/waitlist.service";
import {
  GetReservationListModel,
  ReservationService
} from "../../reservation/reservation.service";
import { FormControl } from "@angular/forms";
import { Panels } from "../../settings/settings.service";
import { Subscription } from "rxjs";
import { User } from "../../_models";

@Component({
  selector: "aside-panel",
  templateUrl: "./aside-panel.component.html",
  styleUrls: ["./aside-panel.component.scss"],
  providers: [WaitlistService, ReservationService]
})
export class AsidePanelComponent implements OnInit {
  currentUser: User;
  waitlistHeaderId: any;
  getWaitlistModel: GetWaitlistModel = new GetWaitlistModel();
  getReservationListModel: GetReservationListModel = new GetReservationListModel();
  rotation: number = 0;
  selectedItem: any;
  shiftLayoutID: string;
  totalTops: number = 0;
  totalTables: number = 0;
  serverRotations: any[] = [];
  shiftSectionTables: any[] = [];
  serverData: any[] = [];
  selectedRotation: any;
  reservationTotalCovers: number = 0;
  reservationTotalParties: number = 0;
  reservationDataAvailable: boolean = false;
  waitlistTotalCovers: number = 0;
  waitlistTotalParties: number = 0;
  waitlistDataAvailable: boolean = false;
  waitlistData: any[] = [];
  reservations: any[] = [];
  reservationHeaderDetail: any;
  availableReservation: any;
  reservationDate = new FormControl(new Date());
  ReservationHeaderId: any;
  totalListParties: number = 0;
  totalListGuests: number = 0;
  selectedTime: Date;
  headerDetail: any;
  partiesGuestNumber: any = [];
  notes: any;
  noReservationResults: boolean = true;
  noWaitlistDataResults: boolean = true;
  scrollReachedBottom: boolean = false;
  reservationScrollReachedBottom: boolean = false;
  storedWaitListData: any[] = [];
  storedReservations: any[] = [];
  intervalInstance: any;
  modules: ModuleStatus = new ModuleStatus();

  private updateReservationsSubscription: Subscription;
  private updateWaitListSubscription: Subscription;

  sortData: SortingList = new SortingList();
  @Input()
  tables: Table[] = [];
  @Input()
  selectedFloorPlanId: string;
  @Input()
  parent: any;
  @Input()
  panelToggle: boolean;
  @Input()
  tableID: string;
  @Output()
  panelToggleChange: EventEmitter<boolean> = new EventEmitter();
  @Input()
  waitlistStats: WaitListStats = new WaitListStats();
  @Input()
  reservationStats: ReservationStats = new ReservationStats();
  @Input()
  panels: Panels;

  constructor(
    public dialog: MatDialog,
    private waitlistService: WaitlistService,
    public initialize: InitializeService,
    private shared: SharedDataService,
    public tzone: TimeZoneService,
    public update: UpdateResultsService,
    public alert: AlertService,
    public tableService: TableService,
    private reservationService: ReservationService
  ) {
    this.modules = this.initialize.returnModuleStatus();
    this.updateReservationsSubscription = update.updateReservation$.subscribe(
      update => {
        this.storedReservations = [];
        this.getReservationListModel.pageNumber = 1;
        this.getReservationList();
      }
    );

    this.updateWaitListSubscription = update.updateWaitlist$.subscribe(
      update => {
        this.storedWaitListData = [];
        this.getWaitlistModel.pageNumber = 1;
        this.getWaitlistDatalist();
      }
    );
  }

  ngOnInit() {
    this.modules.hasModuleWaitList && this.getWaitlistDatalist();
    this.modules.hasModuleReservations && this.getReservationList();
  }

  closeSeatFromListPanel() {
    this.panelToggle = false;
    this.panelToggleChange.emit(false);
  }

  getNextWaitListDataSet(event) {
    this.getWaitlistDatalist();
  }

  getWaitlistDatalist() {
    this.getWaitlistModel.waitListID = "";
    this.getWaitlistModel.clientID = this.shared.getClientID();
    let d = this.tzone.getClientDateTimeWithLTZone(new Date()),
      fromDate = new Date(d.setHours(0, 0, 0, 0)),
      toDate = new Date(d.setHours(24, 0, 0, 0));
    this.getWaitlistModel.clientID = this.shared.getClientID();
    this.getWaitlistModel.fromDate = this.tzone.getLocalTimeWithCTZone(
      fromDate
    );
    this.getWaitlistModel.toDate = this.tzone.getLocalTimeWithCTZone(toDate);
    this.sortData.sortColumn = "waitListName";
    this.sortData.sortDirection = 1;
    this.getWaitlistModel.sortingList.push(this.sortData);
    this.waitlistService.getWaitlistDatalist(this.getWaitlistModel).subscribe(
      data => {
        this.waitlistStats.totalCovers = data.data.totalCovers;
        this.waitlistStats.totalParties = data.data.totalParites;

        this.noWaitlistDataResults =
          data.data.waitListDataList.items.length > 0 &&
          data.data.waitListDataList.totalRecords >
            this.getWaitlistModel.pageSize
            ? false
            : true;

        let newList = data.data.waitListDataList.items;
        this.storedWaitListData = this.storedWaitListData.concat(newList);
        this.getWaitlistModel.pageNumber = this.getWaitlistModel.pageNumber + 1;

        this.updateData(this.storedWaitListData);
        this.updateProgress(this.storedWaitListData);
      },
      error => {}
    );
  }

  updateData(data) {
    this.waitlistData = this.waitlistService.updateTimeProgress(data);
    this.waitlistData = this.getWaitlistGroupedlist(this.waitlistData);
  }

  updateProgress(data) {
    setTimeout(() => {
      this.updateData(data);
    }, 600);
    clearInterval(this.intervalInstance);
    this.intervalInstance = setInterval(() => {
      this.updateData(data);
    }, 30000);
  }

  getNextReservationSet(event) {
    this.getReservationList();
  }

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
    // this.filterModel.totalCovers = this.ReservationHeaderId;
    this.reservationService
      .getReservationList(this.getReservationListModel)
      .subscribe(
        data => {
          this.reservationStats.totalCovers = data.totalCovers;
          this.reservationStats.totalParties = data.totalParites;

          this.noReservationResults =
            data.reservations.items.length > 0 &&
            data.reservations.totalRecords >
              this.getReservationListModel.pageSize
              ? false
              : true;
          this.headerDetail = data.headerDetail;
          this.headerDetail = _.sortBy(this.headerDetail, function (
            reservation
          ) {
            return reservation.numberOfTop;
          });

          let newList =  _.sortBy(data.reservations.items, function (
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
        error => {}
      );
    //this.reservationDate = new FormControl(new Date());
  }

  getGroupedlist(data) {
    let list = _.toArray(_.groupBy(data, "reservationTime"));
    return list;
  }

  getWaitlistGroupedlist(data) {
    let list = _.toArray(_.groupBy(data, "waitListName"));
    return list;
  }

  // clear subscription on destroy
  ngOnDestroy() {
    this.updateReservationsSubscription.unsubscribe();
    this.updateWaitListSubscription.unsubscribe();
  }
}
