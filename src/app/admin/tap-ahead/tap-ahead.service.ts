import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
//import { environment } from "../../../environments/environment";

export class TapAhead {
  clientID: string = null;
  maxPartySize: number = 0;
  from: string;
  to: string;
  tapAheadSettingUrl: string = "wewewew";
  theme: string;
  error: string;
  blobNameForLogo: string;
}

@Injectable()
export class TapaheadService {
  constructor(private http: HttpClient) {}

  // getTapahead(clientid : string) {
  //   return this.http.get<any>(
  //     environment.API + "/Settings/admin/tapaheadsettings/" + clientid
  //   );
  // }

  // saveTapaheadSettings(model) {
  //   return this.http.post<any>(
  //     environment.API + "/Settings/admin/tapaheadsettings/save",
  //     model
  //   );
  // }
}
