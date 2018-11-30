import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChange
} from "@angular/core";

export class timePicker {
  hour: number = 7;
  minute: number = 15;
  meriden: string = "PM";
  format: number = 12;
}

@Component({
  selector: "time-picker",
  template: `    
  <w-mat-timepicker [ngClass]="error ? 'mat-form-field-invalid' : 'null'" color="primary" (userTimeChange)="updateTime($event)" [(userTime)]="pickerTime" onpaste="return false"></w-mat-timepicker>
 `
})
export class TimePickerComponent implements OnInit {
  @Input()
  time: any;
  @Input()
  error: string;
  public pickerTime: timePicker;

  @Output()
  timeChange: EventEmitter<Date> = new EventEmitter();

  ngOnInit() {
    this.convertTimeforPicker(this.time);
  }

  convertTimeforPicker(time) {
    let t = new timePicker();
    let d = new Date(time);
    t.hour = ((d.getHours() + 11) % 12) + 1;
    t.minute = d.getMinutes();
    t.meriden = d.getHours() >= 12 ? "PM" : "AM";
    this.pickerTime = t;
  }

  // update time back to parent component
  updateTime(userTime: timePicker) {
    let nt = new Date();
    nt.setHours(
      userTime.meriden == "PM" && userTime.hour < 12
        ? userTime.hour + 12
        : userTime.meriden == "AM" && userTime.hour == 12
          ? userTime.hour - 12
          : userTime.hour
    );
    nt.setMinutes(userTime.minute);
    this.timeChange.emit(nt);
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes.time) {
      this.convertTimeforPicker(changes.time.currentValue);
    }
  }
}
