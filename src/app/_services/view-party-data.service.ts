import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../environments/environment";

export class ReservationData {
  reservationID: number;
  adultCovers: number;
  childCovers: number;
}

@Injectable()
export class ViewPartyDataService {
  constructor(private http: HttpClient) {}

  //Service to get waitlist data
  getWaitlistData(waitlistId) {
    return this.http
      .get<any>(environment.API + "/WaitListData/" + waitlistId)
      .map(list => {
        return list;
      });
  }
  //Service to get Reservation data
  getReservationData(reservationId: string, clientId: string) {
    return this.http.get<any>(
      environment.API +
        "/Reservation/getReservation/" +
      reservationId +
        "/" +
      clientId
    );
  }
  //to get text message from guest
  getTextMessage(model) {
    return this.http.post<any>(
      environment.API + "/textmessage/list",
      model
    );
  }
  //to post text message from guest
  postTextMessage(model) {
    return this.http.post<any>(
      environment.API + "/textmessage/sendReservationTextMessage",
      model
    );
  }
  ReservationEdit(model) {
    return this.http.post<any>(environment.API + "/Reservation/edit", model);
  }
}
