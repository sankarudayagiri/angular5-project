import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
//import { environment } from "./../../environments/environment";
import { Cacheable } from "ngx-cacheable";

export class RemindMeSetupScreen {
  remindMeSetupScreen: boolean = true;
}
export class Panels {
  isStatusBarVisible: boolean = false;
  isStatusBarClockVisible: boolean = false;
  isStatusBarReservationVisible: boolean = false;
  isStatusWaitlistVisible: boolean = false;
  showWaitlist: boolean = false;
  showReservationList: boolean = false;
  showSeatedList: boolean = false;
  showServerPanel: boolean = false;
  colourPalettes: any[] = [];
}
export class Palettes {
  primaryColour: string = null;
  secondaryColour: string = null;
}
export class seatThresholds {
  covers: number;
  threshold: number;
}

@Injectable()
export class SettingsService {
  public userPreferences: any;
  public adminPreferences: any;

  constructor(private http: HttpClient) {}

  // saveUserPreference(model: any) {
  //   return this.http.post<any>(
  //     environment.API + "/Settings/Preferences",
  //     model
  //   );
  // }


  // @Cacheable()
  // getAdminPreference(clientid: string) {
  //   return this.http.get<any>(
  //     environment.API + "/Settings/AdminPreferences/" + clientid
  //   );
  // }

  // saveAdminPreference(model: any) {
  //   return this.http.post<any>(
  //     environment.API + "/Settings/AdminPreferences",
  //     model
  //   );
  // }
}
