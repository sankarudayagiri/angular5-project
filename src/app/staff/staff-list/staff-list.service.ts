import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
//import { environment } from "../../../environments/environment";
import { Cacheable, CacheBuster } from "ngx-cacheable";
import { Subject } from "rxjs";

export class StaffModel {
  showManagers: boolean = null;
  showServers: boolean = null;
  showKitchenStaff: boolean = null;
  showOthers: boolean = null;
  pageNumber: number = 1;
  pageSize: number = 200;
  sortDirection: number = 1;
  clientID: string;
}

export class Staff {
  colorCode: string;
  firstName: string;
  id: string;
  initials: string;
  isKitchenStaff: boolean;
  isManager: boolean;
  isOther: boolean;
  isServer: boolean;
  lastName: string;
  pager: number;
  phoneNumber: number;
}

export class staffCount {
  all: number = 0;
  servers: number = 0;
  managers: number = 0;
  kitchenstaff: number = 0;
  others: number = 0;
}

const cacheBuster$ = new Subject<void>();

@Injectable()
export class StaffListService {
  constructor(private http: HttpClient) {}

  @Cacheable({
    cacheBusterObserver: cacheBuster$
  })
  // getStaffList(model) {
  //   return this.http.post<any>(
  //     environment.API + "/Shift/layout/stafflist",
  //     model
  //   );
  // }

  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$
  // })
  // createStaff(model) {
  //   return this.http.post<any>(
  //     environment.API + "/Server/admin/createUpdate",
  //     model
  //   );
  // }

  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$
  // })
  // updateStaff(model) {
  //   return this.http.post<any>(
  //     environment.API + "/Server/admin/updateServer",
  //     model
  //   );
  // }

  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$
  // })
  // deleteStaff(id: string) {
  //   return this.http.delete<any>(
  //     environment.API + "/Server/admin/delete/" + id
  //   );
  // }
}
