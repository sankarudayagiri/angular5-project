import { Component, OnInit, EventEmitter } from "@angular/core";
import { DatePipe } from "@angular/common";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import * as _ from "underscore";
import {
  ReservationRuleService,
  Rule,
  specificDate
} from "../reservation-rule/reservation-rule.service";
import {
  AlertService,
  LoaderService,
  DiscardDialogService,
  SharedDataService,
  TimeZoneService
} from "../../_services";
import { FormGroup, FormBuilder } from "@angular/forms";
import { AdminHeaderService } from "../admin-header/admin-header.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-reservation",
  templateUrl: "./reservation-rule.component.html",
  styleUrls: ["./reservation-rule.component.scss"],
  providers: [ReservationRuleService, DatePipe, DiscardDialogService]
})
export class ReservationRuleComponent implements OnInit {
  options: FormGroup;
  errorMessage: string;
  ruleSpecificDates: specificDate[] = [];
  rules: Rule[] = [];
  savedRules: any = [];
  addDate: boolean = true;
  alerts: any = [];
  dismissible = false;
  success: boolean;
  failure: boolean;
  date: Date = new Date();
  ft: any;
  tt: any;
  showDeleteID: number;
  discardConfirm: EventEmitter<boolean> = new EventEmitter();
  dateTime: string;
  timezone: string;

  constructor(
    fb: FormBuilder,
    private ruleService: ReservationRuleService,
    private loaderService: LoaderService,
    private AdminHeaderService: AdminHeaderService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private discardService: DiscardDialogService,
    private shared: SharedDataService,
    public tzone : TimeZoneService
  ) {
    this.timezone = this.tzone.getSavedClientTimeZone();
    this.dateTime = this.tzone.getClientTimeWithCTZone(new Date());
    this.options = fb.group({
      hideRequired: false,
      floatLabel: "auto"
    });
    this.AdminHeaderService.showAdminHeader(true);
    this.loaderService.showLoader(true);
    discardService.confirm$.subscribe(confirm => {
      this.discardConfirm.emit(confirm);
    });
  }

  ngOnInit() {
    this.getReservationList();
  }

  // get list of reservation list
  getReservationList() {
    let self = this;
    this.ruleService.getReservationLists(this.shared.getClientID(), false).subscribe(
      data => {
        _.each(data, function(i) {
          i.timeSlot = i.interval ? true : false;
          i.id = null;
          i.specificDateError = false;
          i.fromTime = self.tzone.setUTCAsLocal(i.fromTime);
          i.toTime = self.tzone.setUTCAsLocal(i.toTime);
          if (i.ruleSpecificDates.length) {
            _.each(i.ruleSpecificDates, function(d) {
              d.id = null;
              d.date = self.dateTime;
              delete d.reservationRuleID;
            });
          }
        });
        this.savedRules = JSON.parse(JSON.stringify(data));
        this.rules = data;
        this.loaderService.showLoader(false);
      },
      error => {
        this.alertService.error(error.error.message);
      }
    );
  }

  // creating new rule
  createNewRule() {
    let rule = new Rule();
    let d = new Date();
    rule.fromTime = new Date(d.setHours(0, 0, 0, 0));
    rule.toTime = new Date(d.setHours(23, 59, 59, 0));
    this.rules.push(rule);
  }

  //save rules
  saveReservationRule() {
    var self = this;
    let errorInRules = _.findWhere(self.rules, { error: true });
    let specificDateErrorInRules = _.findWhere(self.rules, {
      specificDateError: true
    });

    if (errorInRules || specificDateErrorInRules) {
      this.alertService.error("Sorry! Please fix the error and try again.");
    } else {
      this.loaderService.showLoader(true);
      let rules = JSON.parse(JSON.stringify(this.rules));
      _.each(rules, function(i) {
        i.id = null;
        i.interval = i.timeSlot ? i.interval : null; // set interval value
        if (i.recurrenceType != 1) {
          i.ruleSpecificDates = [];
        } else {
          i.ruleSpecificDates = self.getTimeZoneCovertedDates(
            i.ruleSpecificDates
          );
        }
        i.dateForToday = i.recurrenceType == 2 ? self.dateTime : null;
        i.allowedPerInterval = i.interval ? i.totalAllowed : null;
        i.fromTime = self.tzone.getLocalTime(i.fromTime);
        i.toTime = self.tzone.getLocalTime(i.toTime);
        i.clientID = self.shared.getClientID();
        delete i.error;
      });

      this.ruleService
        .saveReservationRule(rules, this.shared.getClientID())
        .subscribe(
          data => {
            this.loaderService.showLoader(false);
            this.alertService.success("Reservation rules saved successfully.");
            // this.getReservationList();
            this.savedRules = JSON.parse(JSON.stringify(this.rules));
          },
          error => {
            this.loaderService.showLoader(false);
            this.alertService.error(error.error.message);
          }
        );
    }
  }

  getTimeZoneCovertedDates(dates) {
    let self = this;
    _.each(dates, function(d) {
      d.date = self.tzone.getLocalTimeWithCTZone(d.date);
    });
    return dates;
  }

  // delete Rule
  showDeleteConfirm(index) {
    this.showDeleteID = index;
  }

  deleteRule(index, id) {
    this.rules.splice(index, 1);
    if (id != 0) this.saveReservationRule();
    this.showDeleteID = null;
  }

  //discard changes
  discardChanges() {
    let savedRules = JSON.parse(JSON.stringify(this.savedRules));
    this.rules = savedRules;
  }

  addEvent(event: MatDatepickerInputEvent<Date>, index: number) {
    this.rules[index].specificDateError = false;
    let date = new specificDate();
    date.id = null;
    date.date = event.value;
    let addDate = true;
    let selDate = date.date;
    let spDates = this.rules[index].ruleSpecificDates;
    if (spDates.length == 0) {
      this.rules[index].ruleSpecificDates.push(date);
      addDate = false;
    } else {
      _.each(spDates, function(i) {
        let d = new Date(i.date),
          s = new Date(selDate);
        let isExist =
          d.getDate() == s.getDate() && d.getMonth() == s.getMonth();

        if (isExist) {
          addDate = false;
        }
      });
    }
    if (addDate) {
      spDates.push(date);
    }
  }

  removeDate(j, index) {
    this.rules[index].ruleSpecificDates.splice(j, 1);
    this.rules[index].specificDateError = this.rules[index].ruleSpecificDates
      .length
      ? false
      : true;
  }

  compareTwoDates(r) {
    let fromTime = new Date(r.fromTime).setSeconds(0, 0);
    fromTime = new Date(fromTime).setDate(new Date().getDay());
    let toTime = new Date(r.toTime).setSeconds(0, 0);
    toTime = new Date(toTime).setDate(new Date().getDay());
    r.error = fromTime.valueOf() >= toTime.valueOf() ? true : false;
  }

  // check for unsaved changes
  canDeactivate(): Observable<boolean> | boolean {
    let rulesNotChanged =
      JSON.stringify(this.savedRules) === JSON.stringify(this.rules);
    if (rulesNotChanged) {
      return true;
    }
    this.discardService.openDiscardChangesDialog();
    return this.discardConfirm;
  }
}
