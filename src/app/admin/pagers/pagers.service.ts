import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../../environments/environment";

export class PagersData {
  clientID: string = "";
  isLocalPagingEnabled: boolean = false;
  isSelectAll: boolean = true;
  alphaPagers: any = [];
  numericPagers: any = [];
  createdDate: Date = new Date();
  pagingMessages: any = [];
  localPagerIPAddress: string = null;
  localPagerType: string = null;
  localPagerBaudRate: string = null;
  localPagerBeeps: string = null;
}

@Injectable()
export class PagerService {
  constructor(private http: HttpClient) {}

  getPagerData(clientid: string) {
    return this.http.get<any>(
      environment.API + "/Settings/admin/pagersettings/" + clientid
    );
  }

  savePagerData(model) {
    return this.http.post<any>(
      environment.API + "/Settings/admin/pagersettings/save",
      model
    );
  }
}
