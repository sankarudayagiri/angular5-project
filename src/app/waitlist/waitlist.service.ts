import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as _ from "underscore";
import "rxjs/add/operator/map";
import { environment } from "../../environments/environment";
import { stringTimeToMinutesPipe } from "../_pipes/";
import { GuestDetails } from "../_services";
import { Cacheable, CacheBuster } from "ngx-cacheable";
import { Subject } from "rxjs";

export class GetWaitlistModel {
  nameOrPhone: string;
  waitListID: string = "";
  fromDate: string;
  toDate: string;
  numberOfParties: number;
  pageNumber: number = 1;
  pageSize: number = 10;
  sortingList: any[] = [];
  clientID: string;
}

export class SortingList {
  pageSize: number = 10;
  sortColumn: string;
  sortDirection: number;
}

export class WaitlistModel {
  waitListDataID: string = "";
  suggestedTableID: null;
  guest: GuestDetails = new GuestDetails();
  waitListID: string = "";
  notesToAdd: any[] = [];
  customNotes: string;
  adultCovers: number = 0;
  childCovers: number = 0;
  priorityID: string;
  waitListTypeID: string; //WalkIn,CallAhead
  arrivedTime: Date = new Date();
  quotedWaitTime: string = "0";
  pagerNumber: number = null;
  isFromReservation: true;
  createdDate: string;
  currentDate: Date = new Date();
  clientID: string;
  waitListName: string;
  waitListType: any;
}

export class ChangeWaitlistModel {
  fromDate: Date;
  toDate: Date;
  clientID: string;
}

export class WaitListHistory {
  clientID: string;
  fromDate: string;
  toDate: string;
  statusIDs: any[] = [];
  nameOrPhone: string;
  pageNumber: number = 1;
  pageSize: number = 10;
  sortColumn: string;
  sortDirection: number;
}

export class PartyConfirm {
  waitListDataID: string;
  clientID: string;
}

export class SeatPartyModel {
  id: string;
  tableID: string;
  seatedTime: string;
  clientID: string;
}

export class SendMessage {
  pagerNumber: string;
  messageText: string;
  clientID: string;
  waitListDataID: string;
  shiftID: string;
  serverID: string;
}

export class guestMessage {
  saveMessage: boolean = false;
  messageText: string = null;
  waitListDataID: string = null;
  clientID: string;
  isFromWeb: boolean = true;
}

const cacheBuster$ = new Subject<void>();

@Injectable()
export class WaitlistService {
  constructor(
    private http: HttpClient,
    private stringTimeToMinutes: stringTimeToMinutesPipe
  ) {}

  // service to post change waitlist
  getChangeWaitList(model) {
    return this.http.post<any>(
      environment.API + "/WaitListData/changewaitlist",
      model
    );
  }

  @Cacheable({
    cacheBusterObserver: cacheBuster$
  })
  getWaitlist(clientID) {
    return this.http.get<any>(environment.API + "/waitlist/list/" + clientID);
  }

  getWaitlistDatalist(model) {
    return this.http.post<any>(
      environment.API + "/WaitlistData/listdata",
      model
    );
  }

  //Service to get waitlist data
  getWaitlistData(waitListDataID, clientID) {
    return this.http.get<any>(
      environment.API + "/WaitListData/" + waitListDataID + "/" + clientID
    );
  }

  //service to add data to waitlist
  addToWaitList(model) {
    return this.http.post<any>(environment.API + "/WaitListData/Add", model);
  }

  //service to get no show
  noshow(waitListDataID, clientID) {
    return this.http
      .get<any>(
        environment.API +
          "/WaitListData/noshow/" +
          waitListDataID +
          "/" +
          clientID
      )
      .map(list => {
        return list;
      });
  }

  //undo
  undoNoShow(waitListDataHistoryID: string, clientID: string) {
    return this.http.get<any>(
      environment.API +
        "/WaitListData/undo/" +
        waitListDataHistoryID +
        "/" +
        clientID
    );
  }

  //move to history
  movePartyToHistory(waitListDataId: string, clientId: string) {
    return this.http.post<any>(
      environment.API + "/WaitListData/moveToHistory",
      {
        ID: waitListDataId,
        ClientID: clientId
      }
    );
  }

  //service to delete waitlist
  deleteWaitlistData(waitListDataId: string, clientId: string) {
    return this.http.delete<any>(
      environment.API +
        "/WaitListData/delete/" +
        waitListDataId +
        "/" +
        clientId
    );
  }

  updateTimeProgress(items) {
    let self = this;
    _.each(items, function(item) {
      if (item.isFromReservation) {
        item.waitListType.description = "Walk-in";
        item.waitListType.id = 1;
      }

      let createdTime = item.seatedTime
          ? new Date(item.waitListDataCreatedDate)
          : new Date(item.createdDate),
        currentTime = item.seatedTime ? new Date(item.seatedTime) : new Date(),
        diff = (currentTime.getTime() - createdTime.getTime()) / 60000,
        hours =
          Math.floor(diff / 60) > 9
            ? Math.floor(diff / 60)
            : "0" + Math.floor(diff / 60),
        minutes =
          Math.floor(diff % 60) > 9
            ? Math.floor(diff % 60)
            : "0" + Math.floor(diff % 60);
      item.spentTime = hours + ":" + minutes;
      item.percent = self.getPercentage(item.quotedWaitTime, diff);
    });

    return items;
  }

  convertMinsToStringTime(t) {
    let hours =
        Math.floor(t / 60) > 9 ? Math.floor(t / 60) : "0" + Math.floor(t / 60),
      minutes =
        Math.floor(t % 60) > 9 ? Math.floor(t % 60) : "0" + Math.floor(t % 60),
      time = hours + ":" + minutes;
    return time;
  }

  getPercentage(quotedTime, diff) {
    let percent = (diff / this.stringTimeToMinutes.transform(quotedTime)) * 100;
    return percent;
  }

  //service to add Waitlist
  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  addToList(model) {
    if (model.id) {
      return this.http.post<any>(environment.API + "/waitlist/update", model);
    } else {
      return this.http.post<any>(environment.API + "/waitlist/create", model);
    }
  }

  //delete waitlist
  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  deleteWaitlist(waitListId: string, clientId: string) {
    return this.http.delete<any>(
      environment.API + "/waitlist/delete/" + waitListId + "/" + clientId
    );
  }

  //waitlist history
  postWaitlistHistory(model) {
    return this.http.post<any>(
      environment.API + "/WaitListData/history",
      model
    );
  }

  editWaitlist(model) {
    return this.http.post<any>(environment.API + "/WaitListData/Edit", model);
  }

  waitListDataConfirm(model) {
    return this.http.post<any>(
      environment.API + "/WaitListData/confirm",
      model
    );
  }

  postWaitListTextMessage(model) {
    return this.http.post<any>(
      environment.API + "/textmessage/sendWaitListTextMessage",
      model
    );
  }

  //wait-list item pager
  sendMessageToPager(model) {
    return this.http.post<any>(
      environment.API + "/pagermessage/sendmessagetopager",
      model
    );
  }

  getAveragewaitTime(clientID: string) {
    return this.http.get<any>(
      environment.API + "/WaitListData/GetAverageWaitTime/" + clientID
    );
  }
}
