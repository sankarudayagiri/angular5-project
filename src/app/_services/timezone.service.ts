import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
//import { environment } from "../../environments/environment";
import { SessionService } from "./session.service";
import { DatePipe } from "@angular/common";

@Injectable()
export class TimeZoneService {
  constructor(
    private http: HttpClient,
    private session: SessionService,
    private datePipe: DatePipe
  ) {}

  // store timezone
  storeClientTimeZone(timezone: any) {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.role == "JtechAdmin") {
      this.session.storeClientTimeZone(JSON.stringify(timezone));
    } else {
      localStorage.setItem("timeZone", JSON.stringify(timezone));
    }
  }

  getSavedClientTimeZone() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.role == "JtechAdmin") {
      return this.convertTimeZoneFormat(JSON.parse(sessionStorage.timeZone));
    } else {
      return this.convertTimeZoneFormat(
        JSON.parse(localStorage.getItem("timeZone"))
      );
    }
  }

  convertTimeZoneFormat(stringtime) {
    if (stringtime) {
      let parts = stringtime.offset.split(":");
      let val = parts[0].charAt(0);
      return val != "+" && val != "-"
        ? "+" + parts[0] + "" + parts[1]
        : parts[0] + "" + parts[1];
    }
  }

  getServerTime() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.role == "JtechAdmin") {
      let obj = JSON.parse(sessionStorage.timeZone),
        date = obj.serverTime;
      return date;
    } else {
      let obj = JSON.parse(localStorage.getItem("timeZone")),
        date = obj.serverTime;
      return date;
    }
  }

  // get client date and time with client timezone
  getClientTimeWithCTZone(date) {
    let d = this.datePipe.transform(
      date,
      "MMM d, y, h:mm:ss a",
      this.getSavedClientTimeZone()
    );
    d = d + " " + this.getSavedClientTimeZone();
    return d;
  }

  // get client date and time with local timezone
  getClientDateTimeWithLTZone(date) {
    return new Date(
      this.datePipe.transform(
        date,
        "MMM d, y, h:mm:ss a",
        this.getSavedClientTimeZone()
      )
    );
  }

  // get local date and time with client timezone
  getLocalTimeWithCTZone(date) {
    let time = new Date(date);
    time.setSeconds(0);
    let stringTime = this.datePipe.transform(time, "MMMM d, y h:mm:ss a");
    return stringTime + " " + this.getSavedClientTimeZone();
  }

  // get client date and time without timezone
  getClientTime(date) {
    return this.datePipe.transform(
      date,
      "MMM d, y, h:mm:ss a",
      this.getSavedClientTimeZone()
    );
  }

  // get local date and time without timezone
  getLocalTime(date) {
    let d = new Date(date);
    let ct = this.getClientDateTimeWithLTZone(new Date());
    d.setDate(ct.getDate());
    d.setSeconds(0);
    return this.datePipe.transform(d, "MMM d, y, h:mm:ss a");
  }

  // set UTC date and time as local without timezone
  setUTCAsLocal(date) {
    let d = new Date(date);
    d.setHours(d.getUTCHours());
    d.setMinutes(d.getUTCMinutes());
    return this.datePipe.transform(d, "MMM d, y, h:mm:ss a");
  }

  // getClientTimeZone(clientId: string) {
  //   return this.http.get<any>(
  //     environment.API + "/client/getClientTimeZoneOffset/" + clientId
  //   );
  // }
}
