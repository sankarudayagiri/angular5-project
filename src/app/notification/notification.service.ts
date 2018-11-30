import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../environments/environment";

export class NotificationList {
  date: Date = new Date();
  clientID: string;
}

@Injectable()
export class NotificationService {
  constructor(private http: HttpClient) {}

  openNotificationPanel: boolean = false;

  postNotificationList(model) {
    return this.http.post<any>(environment.API + "/notification/list", model);
  }
}
