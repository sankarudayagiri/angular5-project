import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import * as _ from "underscore";
import { environment } from "../../environments/environment";

export class GuestDetails {
  id: string = "";
  name: string = "";
  phone: number = null;
  countryCode: string = "";
  isFrequentGuest: boolean;
}

export class GuestDetailModel {
  adultCovers: number = 1;
  childCovers: number = 0;
  guest: GuestDetails = new GuestDetails();
  notes: any[] = [];
  customNotes: string;
  pagerNumber: number;
}

@Injectable()
export class GuestService {
  public notes: Array<any> = [];
  constructor(private http: HttpClient) {}

  //Service to get guest details
  // getGuestNumber(num : number, clientid : string, countrycode : number) {
  //   return this.http.get<any>(environment.API + "/Guest/getGuest/" + num + "/" + clientid + "/" + countrycode);
  // }

  // // service to pre-defined notes
  // getNotes(clientid: string) {
  //   return this.http
  //     .post<any>(environment.API + "/Notes/Party/list/" + clientid, null)
  //     .map(list => {
  //       _.each(list, function(i) {
  //         i.selected = false;
  //       });
  //       this.notes = list;
  //       return list;
  //     });
  // }

  // getPreDefinedNotes() {
  //   _.each(this.notes, function(i) {
  //     i.selected = false;
  //   });
  //   return this.notes;
  // }
}
