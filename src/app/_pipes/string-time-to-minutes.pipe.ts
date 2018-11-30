import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "stringTimeToMinutes" })
export class stringTimeToMinutesPipe implements PipeTransform {
  transform(value: any): any {
    const time: string = value;
    let totalMins: number;
    const parts = time.match(/(\d+):(\d+)/);
    if (parts) {
      const hours = parseInt(parts[1]);
      const minutes = parseInt(parts[2]);
      totalMins = (hours * 60) + minutes;
    }
    return totalMins;
  }
}
