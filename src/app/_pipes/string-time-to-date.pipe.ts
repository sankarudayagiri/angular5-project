import { Pipe, PipeTransform } from "@angular/core";
import { SharedDataService, TimeZoneService } from "../_services";

@Pipe({ name: "stringTimeToDate" })
export class stringTimeToDatePipe implements PipeTransform {
  constructor(public shared: SharedDataService, public tzone : TimeZoneService) {}
  transform(value: any): any {
    let time: string = value;
    let startTime = this.tzone.getClientDateTimeWithLTZone(new Date());
    let parts = time.match(/(\d+):(\d+) (AM|PM)/);
    if (parts) {
      let hours = parseInt(parts[1]),
        minutes = parseInt(parts[2]),
        tt = parts[3];
      if (tt === "PM" && hours < 12) {
        hours += 12;
      } else if (tt === "AM" && hours == 12) {
        hours = 0;
      }
      startTime.setHours(hours, minutes, 0, 0);
    }

    return startTime;
  }
}
