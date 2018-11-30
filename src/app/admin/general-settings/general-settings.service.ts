import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { Cacheable, CacheBuster } from "ngx-cacheable";
import { environment } from "../../../environments/environment";
import { Subject } from "rxjs";

export class GeneralSettingsData {
  clientID: string = "";
  company: string = null;
  dba: string = null;
  addressLine1: string = null;
  addressLine2: string = null;
  country: string;
  countryCode: string = null;
  state: string = null;
  city: string = null;
  zipcode: string = null;
  corporateContact: string = null;
  corporatePhone: string = null;
  corporateEmail: string = null;
  siteContact: string = null;
  sitePhone: string = null;
  siteEmail: string = null;
  regionalContact: string = null;
  regionalPhone: string = null;
  regionalEmail: string = null;
  directorContact: string = null;
  directorPhone: string = null;
  directorEmail: string = null;
  feedbackPhone: string = null;
  timeZonesID: string;
}



@Injectable()
export class GeneralSettingsService {
  //const cacheBuster$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  // @Cacheable({
  //   cacheBusterObserver: cacheBuster$
  // })
  getGeneralSettingsData(clientid: string) {
    return this.http.get<any>(
      environment.API + "/Settings/admin/generalsettings/" + clientid
    );
  }

  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$
  // })
  saveGeneralSettingsData(model) {
    return this.http.post<any>(
      environment.API + "/Settings/admin/generalsettings/save",
      model
    );
  }

  @Cacheable()
  getStates(countrycode) {
    return this.http.get<any>(
      environment.API + "/Guest/statesByCountry/" + countrycode
    );
  }

  @Cacheable()
  getTimeZones() {
    return this.http.get<any>(environment.API + "/client/getTimeZoneList");
  }
}
