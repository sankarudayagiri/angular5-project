import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { FormControl } from "@angular/forms";
import { SharedDataService, TimeZoneService } from "../../_services";
@Component({
  selector: "select-date",
  templateUrl: "select-date.component.html"
})
export class SelectDateComponent {
  @Input()
  date = new FormControl(new Date());
  @Input()
  container: string;
  @Output()
  dateChange: EventEmitter<FormControl> = new EventEmitter();
  todayDate: Date;
  displayDate: Date = new Date();

  constructor(public dialog: MatDialog, private shared: SharedDataService, public tzone : TimeZoneService) {
    this.todayDate = this.tzone.getClientDateTimeWithLTZone(new Date());
  }

  // changing dates manually by next/prevous arrow
  setManualDate(n: number) {
    let setDate = this.date.value;
    setDate = setDate.setDate(setDate.getDate() + n);
    this.date = new FormControl(new Date(setDate));
    this.dateChange.emit(this.date);
  }

  // Update date on change
  addEvent(event: MatDatepickerInputEvent<Date>) {
    this.date = new FormControl(new Date(event.value));
    this.dateChange.emit(this.date);
  }
}
