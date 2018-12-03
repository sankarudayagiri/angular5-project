import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
//import { environment } from "../../../environments/environment";
import { Cacheable } from "ngx-cacheable";

export class Rule {
  id: string = null;
  isParty: boolean = true;
  totalAllowed: number = 0;
  interval: number = null;
  allowedPerInterval: number;
  dateForToday: Date;
  fromTime: Date = new Date();
  toTime: Date = new Date();
  recurrenceType: number = 0;
  isMonday: boolean = true;
  isTuesday: boolean = true;
  isWednesday: boolean = true;
  isThursday: boolean = true;
  isFriday: boolean = true;
  isSaturday: boolean = true;
  isSunday: boolean = true;
  isActive: boolean = true;
  ruleSpecificDates: any[] = [];
  timeSlot: boolean = false;
  error: string = null;
  clientID: string;
  specialDay: string = null;
  specificDateError: boolean = false;
}

export class specificDate {
  id: string = null;
  date: Date = new Date();
}

@Injectable()
export class ReservationRuleService {
  constructor(private http: HttpClient) {}

  //@Cacheable()
  // getReservationLists(clientid: string, clearcache : boolean) {
  //   return this.http.get<any>(
  //     environment.API + "/ReservationRule/admin/list/" + clientid
  //   );
  // }

  // saveReservationRule(model, clientID) {
  //   return this.http.post<any>(
  //     environment.API + "/ReservationRule/admin/save",
  //     {
  //       reservationRules: model,
  //       clientID: clientID
  //     }
  //   );
  // }
}
