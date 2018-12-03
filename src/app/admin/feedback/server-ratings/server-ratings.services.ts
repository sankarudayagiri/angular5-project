import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
//import { environment } from "../../../../environments/environment";

export class ServerRatingsFeedback {}

@Injectable()
export class ServerFeedbackService {
  constructor(private http: HttpClient) {}

  // getFiveTopServers(clientid: string) {
  //   return this.http.get<any>(
  //     environment.API + "/Guest/gettopfiveservers/" + clientid
  //   );
  // }

  // getFiveBottomServers(clientid: string) {
  //   return this.http.get<any>(
  //     environment.API + "/Guest/getbottomfiveservers/" + clientid
  //   );
  // }
}
