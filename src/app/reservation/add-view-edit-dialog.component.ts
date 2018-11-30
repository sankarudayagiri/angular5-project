import { Component, OnInit, Inject } from "@angular/core";
import {
  AlertService,
  SharedDataService,
  UpdateResultsService,
  TimeZoneService
} from "../_services";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { GuestDetailModel } from "../_services";
import * as _ from "underscore";
import { ReservationService, ReservationModel } from "./reservation.service";

@Component({
  selector: "add-view-edit-contatiner",
  template: `<div>
  <h6 mat-dialog-title class="dialog-header text-center font-weight-bold mb-0">
      {{data.type == 1 ? 'VIEW RESERVATION' :data.type==2?'UPDATE RESERVATION':'+ ADD RESERVATION'}}
      <i class="material-icons pull-right close cursor-pointer" (click)="onNoClick()">
          clear
      </i>
  </h6>
  <div class="set-date-time-cntr col-12" *ngIf="data.view=='calendar-add' || data.view=='calendar-edit'">
    <select-date [(date)]="data.date" [container]="'dialog'" (dateChange)="updateOnDateChange(data.date)"></select-date>
    <time-slots [timeSlots]="timeSlots" [isTimeSelected]="false" (isTimeSelectedChange)="updateTimeSelected($event)" *ngIf="data.view=='calendar-add' || data.view=='calendar-edit'" [(selectedTime)]="data.guestModel.reservationTime" (selectedTimeChange)="updateTimeChange($event)" [container]="'dialog'" [date]="data.date"></time-slots>
  </div>
  <div class="text-center dialog-footer" *ngIf="data.view=='calendar-add' || data.view=='calendar-edit'">
    <button class="btn btn-lg btn-outline-primary px-4" *ngIf="data.view=='calendar-edit'" (click)="data.view = 'view'; data.type= 1"> <small>CANCEL</small> </button>
    <button class="btn btn-lg btn-outline-primary px-4" [disabled]="!isTimeSelected" *ngIf="data.view=='calendar-add'"(click)="addToReservation()">+ <small>ADD DETAILS</small> </button>
    <button class="btn btn-lg btn-reservation px-4" [disabled]="!isTimeSelected" *ngIf="data.view=='calendar-edit'" (click)="updateTimeSlot()"> <small>UPDATE</small> </button>
  </div>
  <view-reservation *ngIf="data.type==1"></view-reservation>
  <add-edit-reservation *ngIf="data.type == 0 || data.type == 2"></add-edit-reservation>
</div>`,
  providers: [ReservationService]
})
export class AddViewEditDialog implements OnInit {
  guestModel: GuestDetailModel = new GuestDetailModel();
  reservationModel: ReservationModel = new ReservationModel();
  date = new FormControl();
  selectedTime: Date;
  isTimeSelected: boolean = false;

  constructor(
    private alertService: AlertService,
    public dialogRef: MatDialogRef<AddViewEditDialog>,
    public shared: SharedDataService,
    public tzone : TimeZoneService,
    private reservationService: ReservationService,
    public update: UpdateResultsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.date = new FormControl(
      this.tzone.getClientDateTimeWithLTZone(new Date())
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.data.guestModel = this.guestModel;
  }

  updateTimeSelected(event) {
    this.isTimeSelected = event;
  }

  addToReservation() {
    this.data.type = 0;
    this.data.view = "add";
  }

  // ==============changing dates
  updateOnDateChange(date) {
    this.data.date = date;
    this.isTimeSelected = false;
  }

  updateTimeChange(time) {
    this.data.time = time;
  }

  updateTimeSlot() {
    //let today = this.tzone.getClientDateTimeWithLTZone(new Date());
    let d = new Date(this.data.date.value),
      t = new Date(this.data.time);
    let reservationTime = new Date(
      d.setHours(t.getHours(), t.getMinutes(), 0, 0)
    );
    this.reservationModel = this.data.guestModel;
    this.reservationModel.notesToAdd = this.selectedNotes();
    this.reservationModel.currentDate = this.tzone.getLocalTimeWithCTZone(
      reservationTime
    );
    this.reservationModel.reservationTime = this.tzone.getLocalTimeWithCTZone(
      reservationTime
    );

    this.reservationModel.clientID = this.shared.getClientID();
    this.editReservation();
  }

  editReservation() {
    this.reservationService.editReservaion(this.reservationModel).subscribe(
      data => {
        this.update.updateReservations(true);
        this.update.updateTimeSlots(true);
        this.alertService.success("Reservation details updated successfully.");
        this.data.view = "view";
        this.data.type = 1;
      },
      error => {
        this.alertService.error(error.error.message);
      }
    );
  }

  selectedNotes() {
    let notes = _.pluck(_.where(this.data.guestModel.notes.notes), "id");
    notes = notes.filter(function(n) {
      return n != undefined;
    });
    return notes;
  }
}
