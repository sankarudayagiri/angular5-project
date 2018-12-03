import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
//import { environment } from "../../../environments/environment";
//import { Cacheable, CacheBuster } from "ngx-cacheable";
import { Subject } from "rxjs";

export class AccountSettings {
  clientID: string = null;
  code: string = null;
  customerNumber: string = null;
  hotScheduleUserName: string;
  hotSchedulePassword: string;
  hotScheduleConceptNumber: string;
  hotScheduleStoreNumber: string;
  hotScheduleShiftCutoffTime: string;
  accountStatus: number = 1;
  accountDate: Date = new Date();
  accountTerm: string;
  accountBaseAmount: number = 0;
  accountAgreementNumber: string;
  accountIsTest: boolean = false;
  //hasModuleTablesAndStaff: boolean = false;
  hasModuleTable: boolean;
  hasModuleStaff: boolean;
  hasModuleWaitList: boolean;
  hasModuleReservations: boolean;
  hasModuleServerRatings: boolean;
  hasModuleTapAheadSeating: boolean;
}

//const cacheBuster$ = new Subject<void>();

@Injectable()
export class AccountSettingService {
  
  constructor(private http: HttpClient) {}

  // @Cacheable({
  //   cacheBusterObserver: cacheBuster$
  // })
  // accountSettings(clientid: string) {
  //   return this.http.get<any>(
  //     environment.API + "/Settings/admin/accountsettings/" + clientid
  //   );
  // }

  // // @CacheBuster({
  // //   cacheBusterNotifier: cacheBuster$
  // // })
  // saveAccountSettings(model) {
  //   return this.http.post<any>(
  //     environment.API + "/Settings/admin/accountsettings/save",
  //     model
  //   );
  // }
}
