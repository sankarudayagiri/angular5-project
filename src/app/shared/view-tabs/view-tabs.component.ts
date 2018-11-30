import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  OnChanges,
  ViewChild
} from "@angular/core";
import { ViewPartyDataService } from "../../_services/view-party-data.service";
import * as _ from "underscore";
import { SharedDataService, TimeZoneService } from "../../_services";
import { MAT_DIALOG_DATA } from "@angular/material";
import { TabsetComponent, TabDirective } from "ngx-bootstrap";

export class modelList {
  guestID: string;
  clientID: string;
  reservationID: string;
  waitListDataID: string;
  tableID: string;
}

export class VisitHistory {
  leftTime: Date;
  seatedTime: Date;
  tableName: string;
  timeSpent: string;
  totalCovers: number;
}

@Component({
  selector: "view-tabs",
  templateUrl: "view-tabs.component.html",
  styleUrls: ["view-tabs.component.scss"]
})
export class ViewTabsComponent implements OnChanges {
  @Input()
  guestId: string;
  @Input()
  visitHistory: VisitHistory[];
  @Input()
  type: string;
  @Output()
  tabChange: EventEmitter<any> = new EventEmitter();
  @ViewChild(TabsetComponent)
  tabset: TabsetComponent;
  timezone: string;

  GuestId: any;
  guestData: modelList = new modelList();
  guestDetails: any;
  activeTabs: any;
  constructor(
    private dataService: ViewPartyDataService,
    private shared: SharedDataService,
    public tzone : TimeZoneService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.timezone = this.tzone.getSavedClientTimeZone();
  }

  getTimeInMins(stringtime) {
    let time: string = stringtime;
    let parts = time.match(/(\d+):(\d+):(\d+)/);
    return parts[1] + ":" + parts[2];
  }

  getActiveTab() {
    var self = this;
    const tab = this.tabset.tabs.filter(tab => tab.active);
    _.each(tab, function(tabs) {
      var activeTab = tabs.tabset.tabs;
      self.activeTabs = activeTab[0].active ? "communication" : "history";
      self.tabChange.emit(self.activeTabs);
    });
  }

  ngOnChanges(changes: any) {
    let self = this;
    let visitHistory = changes.visitHistory.currentValue;
    _.each(visitHistory, function(visit) {
      visit.timeSpent = self.getTimeInMins(visit.timeSpent);
    });
    this.visitHistory = visitHistory;
    if (this.data.guestModel.guest && this.data.guestModel.guest.id) {
      this.guestData.guestID = this.data.guestModel.guest.id;
      this.guestData.clientID = this.shared.getClientID();
      this.guestData.tableID = "";
      this.guestData.reservationID =
        this.type == "Reservation" ? this.data.guestModel.reservationID : "";
      this.guestData.waitListDataID =
        this.type == "WaitList" ? this.data.waitparty.waitListDataID : "";
      this.guestData.tableID = this.type == "Table" ? this.data.table.id : "";
      this.getTextMessage();
    }
  }

  getTextMessage() {
    this.dataService.getTextMessage(this.guestData).subscribe(data => {
      this.guestDetails = data;
    });
  }
}
