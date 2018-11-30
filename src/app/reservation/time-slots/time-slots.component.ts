import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material";
import {
  ReservationService,
  timeSlot
} from "../../reservation/reservation.service";
import * as _ from "underscore";
import { FormControl } from "@angular/forms";
import { SharedDataService, TimeZoneService } from "../../_services";
import { UpdateResultsService } from "../../_services/update-results.service";
import { Subscription } from "rxjs";

@Component({
  selector: "time-slots",
  templateUrl: "time-slots.component.html",
  styleUrls: ["time-slots.component.scss"]
})
export class TimeSlotsComponent {
  @Input()
  timeSlots: timeSlot[];
  @Input()
  container: string;
  meriden: boolean = true;
  @Input()
  isTimeSelected: boolean = false;
  meridenValue: string = "PM";
  @Input()
  selectedTime: Date;
  filteredTimeSlots: timeSlot[] = [];
  @Input()
  date = new FormControl(new Date());
  @Output()
  selectedTimeChange: EventEmitter<Date> = new EventEmitter();
  @Output()
  noSlotsError: EventEmitter<any> = new EventEmitter();
  @Output()
  isTimeSelectedChange: EventEmitter<boolean> = new EventEmitter();
  @Output()
  slotCount: EventEmitter<any> = new EventEmitter();
  noSlots: boolean;
  pastDate: boolean;
  allDayRule: boolean = false;
  private updateTimeSlotSubscription: Subscription;

  constructor(
    public dialog: MatDialog,
    private shared: SharedDataService,
    public tzone: TimeZoneService,
    private reservationService: ReservationService,
    private update: UpdateResultsService
  ) {
    this.updateTimeSlotSubscription = update.updateTimeSlots$.subscribe(() => {
      this.getReservationSlots(this.date.value);
    });
  }

  ngOnChanges(changes) {
    if (changes && (changes.timeSlots || changes.date)) {
      this.getReservationSlots(this.date.value);
      this.pastDate = this.compareDate(this.date.value);
    }
  }

  compareDate(selectedDate) {
    let today = this.tzone.getClientDateTimeWithLTZone(new Date());
    let todayDateFormatted = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    let compareDate = new Date(selectedDate);
    let compareDateFormatted = new Date(
      compareDate.getFullYear(),
      compareDate.getMonth(),
      compareDate.getDate()
    );
    return compareDateFormatted < todayDateFormatted;
  }

  totalAllowedPendingCount(timeSlots) {
    let count = 0;
    _.each(timeSlots, function(i) {
      count = count + i.allowedPendingCount;
    });
    return count;
  }

  checkSelectedTime(time: Date) {
    return new Date(this.selectedTime).valueOf() == new Date(time).valueOf();
  }

  selectTime(time: Date, count, isParty) {
    this.selectedTime = time;
    this.selectedTimeChange.emit(time);
    !isParty ? this.slotCount.emit(count) : this.slotCount.emit(0);
    this.isTimeSelected = true;
    this.isTimeSelectedChange.emit(this.isTimeSelected);
  }

  // get reservation list
  getReservationSlots(date) {
    let sldate = new Date(date);
    sldate.setHours(0, 0, 0, 0);

    let d = this.tzone.getLocalTimeWithCTZone(sldate);
    this.reservationService
      .getReservationSlots({
        currentDateTime: d,
        clientID: this.shared.getClientID()
      })
      .subscribe(data => {
        this.timeSlots = data.slots.length ? data.slots : [];
        this.filterTimeSlots(this.timeSlots, date);
      });
  }

  filterTimeSlots(items, date) {
    let self = this;
    this.isTimeSelected = false;
    var slots = false;
    this.filteredTimeSlots = JSON.parse(JSON.stringify(items));
    if (items.length < 1) {
      let slot = new timeSlot();
      this.filteredTimeSlots.push(slot);
      this.allDayRule = true;
    } else {
      this.allDayRule = false;
    }
    _.each(this.filteredTimeSlots, function(slot) {
      slot.timeSlotArray = self.reservationService.createTimeSlots(
        slot.allowedFromTime,
        slot.allowedToTime,
        self.meridenValue,
        date
      );
      let st = slot.timeSlotArray.filter(function(t) {
        return t.valueOf() == new Date(self.selectedTime).valueOf();
      });
      if (st.length > 0) {
        self.isTimeSelected = true;
        self.selectedTimeChange.emit(self.selectedTime);
      }
    });

    this.isTimeSelectedChange.emit(this.isTimeSelected);
    for (let i = 0; i <= this.filteredTimeSlots.length - 1; i++) {
      slots = this.filteredTimeSlots[i].timeSlotArray.length > 0 ? true : false;
      if (slots) {
        break;
      }
    }
    this.noSlots = slots ? false : true;
    this.noSlotsError.emit(this.noSlots);
  }

  // update timeslots based on meriden selection
  updateResultsOnMeriden() {
    this.meriden = !this.meriden;
    this.meridenValue = this.meriden ? "PM" : "AM";
    this.filterTimeSlots(this.timeSlots, this.date.value);
  }

  // clear subscription on destroy
  ngOnDestroy() {
    this.updateTimeSlotSubscription.unsubscribe();
  }
}
