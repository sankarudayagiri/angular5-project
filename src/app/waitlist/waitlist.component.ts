import { Component, OnInit } from "@angular/core";
import * as _ from "underscore";

import {
  SharedDataService,
  AlertService,
  LoaderService,
  UpdateResultsService,
  TimeZoneService
} from "../_services";
import {
  WaitlistService,
  GetWaitlistModel,
  WaitListHistory,
  SortingList
} from "./waitlist.service";
import { MatDialog } from "@angular/material";

import { WaitlistAddViewEditDialog } from "./add-view-edit-dialog.component";
import { AddToListComponent } from "./addList/add-list.component";
import { ConfirmDialog } from "../shared/confirm-dialog.component";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";
import { Subscription } from "rxjs";
import { User } from "../_models";
import { AuthenticationService } from "../authentication/authentication.service";

@Component({
  templateUrl: "waitlist.component.html",
  styleUrls: ["waitlist.component.scss"]
})
export class WaitlistComponent implements OnInit {
  currentUser: User;
  waitlistTypes: any[] = [];
  waitlistData: any[] = [];
  headerDetail: any;
  getWaitlistModel: GetWaitlistModel = new GetWaitlistModel();
  selectedTab: any = 1;
  value: any;
  selectedListID: string = null;
  waitlistDate: Date = new Date();
  showWaitListTab: boolean = true;
  waitlistHeaderId: any;
  partiesGuestNumber: any = [];
  totalListParties: number = 0;
  totalListGuests: number = 0;
  intervalInstance: any;
  waitListHistory: WaitListHistory = new WaitListHistory();
  searchResult: boolean = true;
  waitListName: string;
  textMessageCount: any[] = [];
  scrollReachedBottom: boolean = false;
  storedWaitListData: any[] = [];
  noResults: boolean = true;
  searchWaitListModel: string;
  sortData: SortingList = new SortingList();
  averageWaitTime: any;

  public config: SwiperConfigInterface = {
    slidesPerView: 8
  };

  private updateWaitListSubscription: Subscription;

  constructor(
    private alert: AlertService,
    private shared: SharedDataService,
    public tzone: TimeZoneService,
    public dialog: MatDialog,
    private waitlistService: WaitlistService,
    private loaderService: LoaderService,
    public update: UpdateResultsService,
    private authenticate: AuthenticationService
  ) {
    this.loaderService.showLoader(true);
    this.currentUser = this.authenticate.getUser();

    this.updateWaitListSubscription = update.updateWaitlist$.subscribe(() => {
      this.clearFilters();
      this.selectedTab != 1 && this.getHistory(this.selectedTab);
      this.selectedTab == 1 && this.getWaitlistDatalist(this.selectedListID);
    });
  }

  ngOnInit() {
    let d = this.tzone.getClientDateTimeWithLTZone(new Date()),
      fromDate = new Date(d.setHours(0, 0, 0, 0)),
      toDate = new Date(d.setHours(24, 0, 0, 0));
    this.getWaitlistModel.clientID = this.shared.getClientID();
    this.getWaitlistModel.fromDate = this.tzone.getLocalTimeWithCTZone(
      fromDate
    );
    this.getWaitlistModel.toDate = this.tzone.getLocalTimeWithCTZone(toDate);
    this.waitListHistory.fromDate = this.tzone.getLocalTimeWithCTZone(fromDate);
    this.waitListHistory.toDate = this.tzone.getLocalTimeWithCTZone(toDate);
    this.getWaitlistTypes();
    this.getAverageWaitTime();
  }

  // Average wait time
  getAverageWaitTime() {
    this.waitlistService
      .getAveragewaitTime(this.shared.getClientID())
      .subscribe(
        data => {
          let self = this;
          _.each(data, function(t) {
            t.time = self.waitlistService.convertMinsToStringTime(t.threshold);
          });
          this.averageWaitTime = data;
        },
        error => {
          this.loaderService.showLoader(false);
        }
      );
  }

  clearFilters() {
    this.getWaitlistModel.pageNumber = 1;
    this.waitListHistory.pageNumber = 1;
    this.storedWaitListData = [];
    this.waitlistHeaderId = null;
    this.loaderService.showLoader(true);
  }

  //get waitlist types
  getWaitlistTypes() {
    this.waitlistService.getWaitlist(this.shared.getClientID()).subscribe(
      data => {
        this.waitlistTypes = data.data.waitlistModel;
        this.selectedListID =
          this.selectedListID == null
            ? _.first(this.waitlistTypes).waitListID
            : this.selectedListID;
        this.waitListName = this.waitListName
          ? this.waitListName
          : _.first(this.waitlistTypes).name;
        this.getWaitlistDatalist(this.selectedListID);
      },
      error => {
        this.loaderService.showLoader(false);
      }
    );
  }

  searchWaitlist = _.debounce(function() {
    this.updateSearch(this.searchWaitListModel);
  }, 1000);

  updateSearch(event: string) {
    this.searchResult = false;
    this.clearFilters();
    if (event == "") {
      this.searchResult = true;
    }
    if (this.selectedTab != 1) {
      this.waitListHistory.nameOrPhone = event;
      this.getHistory(this.selectedTab);
    } else {
      this.getWaitlistModel.nameOrPhone = event;
      this.getWaitlistDatalist(null);
    }
  }

  getNextSet(event) {
    this.getWaitlistDatalist(this.selectedListID);
  }

  // get waitlist data
  getWaitlistDatalist(id: string) {
    this.getWaitlistModel.waitListID = id;
    this.getWaitlistModel.numberOfParties = this.waitlistHeaderId;
    this.sortData.sortColumn = "isFromReservation";
    this.sortData.sortDirection = 1;
    this.getWaitlistModel.sortingList.push(this.sortData);
    this.waitlistService.getWaitlistDatalist(this.getWaitlistModel).subscribe(
      data => {
        clearInterval(this.intervalInstance);
        this.loaderService.showLoader(false);
        if (!this.waitlistHeaderId) {
          this.totalListParties = data.data.waitListDataList.items.length;
          this.totalListGuests = this.getTotal(
            data.data.waitListDataList.items
          );
        }
        this.headerDetail = data.data.headerDetail;
        this.headerDetail = _.sortBy(this.headerDetail, function(waitList) {
          return waitList.numberOfTop;
        });
        if (this.searchResult) {
          this.partiesGuestNumber = data.data;
        }

        this.noResults =
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
      error => {
        this.loaderService.showLoader(false);
      }
    );
  }

  getTotal(data) {
    let count = 0;
    _.each(data, function(i) {
      count = count + (i.adultCovers + i.childCovers);
    });
    return count;
  }

  getHistory(tab) {
    this.waitListHistory.clientID = this.shared.getClientID();
    this.waitListHistory.statusIDs = [tab];
    this.waitlistService.postWaitlistHistory(this.waitListHistory).subscribe(
      data => {
        clearInterval(this.intervalInstance);
        this.loaderService.showLoader(false);
        this.textMessageCount = data.textMessageCount;
        if (this.searchResult) {
          this.partiesGuestNumber = data;
        }

        this.noResults =
          data.waitListDataHistoryList.items.length > 0 &&
          data.waitListDataHistoryList.totalRecords >
            this.waitListHistory.pageSize
            ? false
            : true;

        let newList = data.waitListDataHistoryList.items;
        this.storedWaitListData = this.storedWaitListData.concat(newList);
        this.waitListHistory.pageNumber = this.waitListHistory.pageNumber + 1;

        this.updateData(this.storedWaitListData);
        //this.updateProgress(this.storedWaitListData);
      },
      error => {
        this.loaderService.showLoader(false);
      }
    );
  }

  updateData(data) {
    this.waitlistData = this.waitlistService.updateTimeProgress(data);
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

  // get selected waitlist types tab
  onSelectedListTab(id: string, name: string) {
    this.waitListName = name;
    let lid = id;
    if (lid != this.selectedListID) {
      this.clearFilters();
      this.waitlistHeaderId = null;
      this.getWaitlistDatalist(lid);
    }
    this.selectedListID = id;
  }

  onSelectTab(tab: any) {
    this.waitListHistory.nameOrPhone = "";
    this.getWaitlistModel.nameOrPhone = "";
    this.searchWaitListModel = "";
    let t = tab;
    if (t != this.selectedTab || !this.searchResult) {
      this.clearFilters();
      tab != 1 && this.getHistory(t);
      tab == 1 && this.getWaitlistDatalist(this.selectedListID);
    }
    this.selectedTab = tab;
  }

  onSelectedHeaderTab(headerTop: any) {
    this.clearFilters();
    this.waitlistHeaderId = headerTop;
    this.loaderService.showLoader(true);
    this.getWaitlistDatalist(this.selectedListID);
  }

  //addParty dialog
  addParty(time: any, tops: number): void {
    let dialogRef = this.dialog.open(WaitlistAddViewEditDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        type: 0,
        waitListID: this.selectedListID,
        avgTime: time,
        waitListName: this.waitListName,
        tops: tops
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedTab = 1;
        this.getWaitlistModel.pageNumber = 1;
        this.storedWaitListData = [];
        this.loaderService.showLoader(true);
        this.getWaitlistDatalist(this.selectedListID);
      }
    });
  }

  //add to waitlist
  addList(waitList) {
    let dialogRef = this.dialog.open(AddToListComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { waitList: waitList }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clearFilters();
        this.selectedListID = result.waitListID;
        this.waitListName = result.name;
        this.getWaitlistTypes();
      }
    });
  }

  // delete waitlist
  confirmDelete(waitListID, name) {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "400px",
      disableClose: true,
      data: {
        button: "Confirm",
        type: "danger",
        cancelBtn: true,
        message:
          "Delete wait list <span class='text-uppercase'>" +
          name +
          "</span>? Wait list must be empty. This operation cannot be undone."
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.deleteWaitlist(waitListID);
    });
  }

  deleteWaitlist(waitListID) {
    this.waitlistService
      .deleteWaitlist(waitListID, this.shared.getClientID())
      .subscribe(
        data => {
          this.loaderService.showLoader(false);
          this.getWaitlistTypes();
          this.getAverageWaitTime();
        },
        error => {
          this.loaderService.showLoader(false);
          this.alert.error(error.error.message);
        }
      );
  }

  // clear subscription on destroy
  ngOnDestroy() {
    this.updateWaitListSubscription.unsubscribe();
  }
}
