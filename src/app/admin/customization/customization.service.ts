import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
//import { environment } from "../../../environments/environment";

export class CustomizationData {
  clientID: string;
  messageWaitListAddGuest: string =
    "Hold on to your phone. We will text you soon! ";
  messageWaitListCallAhead: string = "Please see host upon arrival.";
  messagePageGuest: string =
    "Please return to the host! Not coming? Let us know!";
  messageNewReservation: string ;
  requestFrequentGuests: boolean = false;
  frequentVisitsCount: number = 0;
  frequentWeeksCount: number = 0;
  waitListTextMessagePrefix: string = "Welcome back!";
  reservationTextMessagePrefix: string = "Welcome back!";
  isGuestPortalActive: boolean = false;
  createdDate: Date = new Date();
  notes: any[] = [];
}

export class notesList {
  id: string;
  clientID: string;
  description: FunctionStringCallback;
}

@Injectable()
export class CustomizationService {
  constructor(private http: HttpClient) {}

  // getCustomizationData(clientid: string) {
  //   return this.http.get<any>(
  //     environment.API + "/Settings/admin/customization/" + clientid
  //   );
  // }

  // saveCustomizationData(model) {
  //   return this.http.post<any>(
  //     environment.API + "/Settings/admin/customization/save",
  //     model
  //   );
  // }
}
