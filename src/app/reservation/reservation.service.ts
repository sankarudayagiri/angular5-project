import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { stringTimeToDatePipe } from "../_pipes";
import { environment } from "../../environments/environment";
import { GuestDetails, SharedDataService, TimeZoneService } from "../_services";
import { Cacheable } from "ngx-cacheable";

export class Rule {
  isParty: boolean = true;
  isRuleExists: boolean = true;
  pendingCount: number = 0;
}

export class timeSlot {
  allowedPendingCount: number = null;
  allowedFromTime: string = "12:00 AM";
  allowedToTime: string = "11:59 PM";
  timeSlotArray: any[];
}

export class GetReservationListModel {
  nameOrPhone: string;
  fromDate: string;
  toDate: string;
  totalCovers: number;
  pageNumber: number = 1;
  pageSize: number = 8;
  sortColumn: string;
  sortDirection: number;
  clientID: string;
  waitListID: string;
  numberOfParties: number = null;
}

export class ReservationModel {
  clientID: string = "";
  reservationID: string = "";
  suggestedTableID: string = "";
  guest: GuestDetails = new GuestDetails();
  notesToAdd: any[] = [];
  customNotes: string;
  adultCovers: number = 0;
  childCovers: number = 0;
  currentDate: string;
  reservationTime: string;
  isEvent: boolean = false;
  isVIP: boolean = false;
  createdDate: string;
  isAddedToWaitList: boolean = false;
}

export class WaitListData {
  reservationID: string;
  waitListID: string;
  quotedWaitTime: string;
  clientID: string;
}

export class ReservationHistory {
  fromDate: string;
  toDate: string;
  statusIDs: any[] = [];
  nameOrPhone: string;
  pageNumber: number = 1;
  pageSize: number = 20;
  sortColumn: string;
  sortDirection: number;
  clientID: string;
}

export class ReservationStatus {
  reservationID: string;
  statusID: number = 0;
  clientID: string;
}

@Injectable()
export class ReservationService {
  constructor(
    private http: HttpClient,
    private stringTimeToDate: stringTimeToDatePipe,
    private shared: SharedDataService,
    public tzone : TimeZoneService
  ) {}

  getReservationList(model) {
    return this.http.post<any>(environment.API + "/Reservation/list", model);
  }

  //@Cacheable()
  getReservationSlots(model) {
    return this.http.post<any>(
      environment.API + "/ReservationRule/availableReservationSlots",
      model
    );
  }

  //service to add data to reservation
  addReservationData(model) {
    return this.http.post<any>(environment.API + "/Reservation/add", model);
  }

  // create timeSlots
  createTimeSlots(ft, tt, meriden, date) {
    let today = this.tzone.getClientDateTimeWithLTZone(new Date());
    let meridenDivider = new Date(today);
    meridenDivider = new Date(meridenDivider.setHours(12, 0, 0, 0));
    let timeSlots = [];
    let cTime = today;
    let sTime = date;
    let fTime = this.stringTimeToDate.transform(ft);
    fTime =
      fTime.valueOf() < cTime.valueOf() && cTime.getDate() == sTime.getDate()
        ? new Date(cTime.setMinutes(cTime.getMinutes() + 15 / 2))
        : fTime;
    fTime = new Date(
      fTime.setMinutes((Math.round(fTime.getMinutes() / 15) * 15) % 60)
    );

    let tTime = this.stringTimeToDate.transform(tt);
    tTime = new Date(tTime.setMinutes(tTime.getMinutes() - 1));
    for (let i = fTime; i <= tTime; i.setMinutes(i.getMinutes() + 15)) {
      if (meriden == "AM" && i < meridenDivider) {
        timeSlots.push(
          new Date(sTime.setHours(i.getHours(), i.getMinutes(), 0, 0))
        );
      } else if (meriden == "PM" && i > meridenDivider) {
        timeSlots.push(
          new Date(sTime.setHours(i.getHours(), i.getMinutes(), 0, 0))
        );
      }
    }
    return timeSlots;
  }

  //move to waitlist
  addToWaitlist(model) {
    return this.http.post<any>(
      environment.API + "/Reservation/moveToWaitList",
      model
    );
  }

  //move to history
  movePartyToHistory(reservationId: string, clientId: string) {
    return this.http.post<any>(environment.API + "/Reservation/moveToHistory", {
      ID: reservationId,
      ClientID: clientId
    });
  }

  //no show
  noshow(reservationId: string, clientid: string) {
    return this.http.get<any>(
      environment.API + "/Reservation/noshow/" + reservationId + "/" + clientid
    );
  }

  //undo no show
  undoNoshow(reservationhistoryid: string, clientid: string) {
    return this.http.get<any>(
      environment.API +
        "/Reservation/undonoshow/" +
        reservationhistoryid +
        "/" +
        clientid
    );
  }

  //delete reservation
  deleteReservation(reservationid: string, clientid: string) {
    return this.http.delete<any>(
      environment.API + "/Reservation/delete/" + reservationid + "/" + clientid
    );
  }

  //reservation history
  postReservationHistory(model) {
    return this.http.post<any>(environment.API + "/Reservation/history", model);
  }

  editReservaion(model) {
    return this.http.post<any>(environment.API + "/Reservation/edit", model);
  }

  stopReservationForToday(model) {
    return this.http.post<any>(
      environment.API + "/Reservation/admin/blockReservation",
      model
    );
  }

  //@Cacheable()
  getBlockedReservationsStatus(model) {
    return this.http.post<any>(
      environment.API + "/Reservation/admin/getBlockedReservationStatus",
      model
    );
  }

  unblockReservation(model) {
    return this.http.post<any>(
      environment.API + "/Reservation/admin/unblockReservation",
      model
    );
  }

  updateStatus(model) {
    return this.http.post<any>(
      environment.API + "/Reservation/updatestatus",
      model
    );
  }
}
