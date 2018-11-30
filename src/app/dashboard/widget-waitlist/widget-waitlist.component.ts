import { Component, OnInit } from "@angular/core";
import * as _ from "underscore";
import {
  SharedDataService,
  InitializeService,
  UpdateResultsService,
  TimeZoneService
} from "../../_services";
import {
  GetWaitlistModel,
  WaitlistService
} from "../../waitlist/waitlist.service";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";
import { Subscription } from "rxjs";

@Component({
  selector: "widget-waitlist",
  templateUrl: "widget-waitlist.component.html",
  styleUrls: ["widget-waitlist.component.scss"]
})
export class WidgetWaitlistComponent implements OnInit {
  public getWaitlistModel: GetWaitlistModel = new GetWaitlistModel();
  public waitlistData: any[] = [];

  public storedWaitListData: any[] = [];
  public waitlistHeaderId: any;
  public totalcovers: number = 0;
  public totalparties: number = 0;
  public selectedWaitlistDataTab: any = "all";
  public noWaitlistDataResults: boolean = true;
  public headerDetail: any;
  public intervalInstance: any;
  public averageWaitTime: any;
  public totalwaitlistCount: any = {};
  public scrollReachedBottom: boolean = false;
  public waitListLoading: boolean;
  public listTabsConfig: SwiperConfigInterface = {
    slidesPerView: 4
  };
  private updateWaitListSubscription: Subscription;

  constructor(
    private shared: SharedDataService,
    public update: UpdateResultsService,
    private initialize: InitializeService,
    public waitlistService: WaitlistService,
    public tzone: TimeZoneService
  ) {
    this.updateWaitListSubscription = update.updateWaitlist$.subscribe(() => {
      this.storedWaitListData = [];
      this.getWaitlistModel.pageNumber = 1;
      this.getWaitlistDatalist();
    });
  }

  ngOnInit() {
    this.getWaitlistDatalist();
    this.getAverageWaitTime();
  }

  getNextWaitListDataSet() {
    this.getWaitlistDatalist();
  }

  // get waitlist data
  getWaitlistDatalist() {
    this.waitListLoading = true;
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
    this.getWaitlistModel.numberOfParties = this.waitlistHeaderId;
    this.waitlistService
      .getWaitlistDatalist(this.getWaitlistModel)
      .subscribe(data => {
        this.waitListLoading = false;
        this.headerDetail = data.data.headerDetail;

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
        this.totalcovers = data.data.totalCovers;
        this.totalparties = data.data.totalParites;
        //this.loaderService.showLoader(false);
      });
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

  onSelectedWaitListHeaderTab(numberOftop) {
    this.storedWaitListData = [];
    this.getWaitlistModel.pageNumber = 1;
    this.waitlistHeaderId = numberOftop == "all" ? null : numberOftop;
    this.selectedWaitlistDataTab = numberOftop;
    this.getWaitlistDatalist();
  }

  // Average wait time
  getAverageWaitTime() {
    this.waitlistService
      .getAveragewaitTime(this.shared.getClientID())
      .subscribe(
        data => {
          let self = this;
          //this.loaderService.showLoader(false);
          _.each(data, function(t) {
            t.time = self.waitlistService.convertMinsToStringTime(
              Math.abs(t.threshold)
            );
          });
          this.averageWaitTime = data;
        },
        error => {}
      );
  }

  // clear subscription on destroy
  ngOnDestroy() {
    this.updateWaitListSubscription.unsubscribe();
  }
}
