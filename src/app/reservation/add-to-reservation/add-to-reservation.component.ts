import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material";
import {
  AlertService,
  SharedDataService,
  TimeZoneService
} from "../../_services";
import { AddViewEditDialog } from "../add-view-edit-dialog.component";
import { ReservationService, ReservationModel } from "../reservation.service";
import { UpdateResultsService } from "../../_services/update-results.service";
import { ConfirmDialog } from "../../shared";
import { User } from "../../_models";
@Component({
  selector: "add-edit-reservation",
  template: `
  <form name="form" #f="ngForm" novalidate class="dialog-scrollable-content">
  <div class="row mt-4 justify-content-center">
    <div class="col-md-8">
      <div class="row my-3 text-center justify-content-center">
        <div class="col-md-3 mr-5 ">
        <div class="d-flex flex-row d-flex align-items-center">
        <h5 class="font-weight-bold mt-1 mr-2 text-muted" >REGULAR</h5>
          <mat-slide-toggle name="isEvent" class="toggle-reservation" [(ngModel)]="isEvent" >
            <h5 class="font-weight-bold mt-1 text-muted">EVENT</h5>
          </mat-slide-toggle>
        </div>
         </div>
        <div class="col-md-3 ml-5 d-flex align-items-center">
          <mat-slide-toggle  name="isVip" class="toggle-reservation"  [(ngModel)]="isVip" >
            <h5 class="font-weight-bold mt-1 text-muted">VIP</h5>
          </mat-slide-toggle>
        </div>
      </div>
    </div>
    <div class="col-12"><hr/></div>
  </div>
  <add-guest [parent]="'reservation'"></add-guest>
  <div class="text-center dialog-footer">
  <button class="btn btn-lg btn-outline-primary px-4" *ngIf="data.type == 2" (click)="data.view = 'view'; data.type= 1"> <small>CANCEL</small> </button>
  <button class="btn btn-lg btn-reservation" (click)="data.guestModel.adultCovers && data.guestModel.guest.name && (data.guestModel.guest.phone && data.guestModel.guest.phone.length >= 7 || !data.guestModel.guest.phone) && addToReservation()">
  <small>{{data.type == 2 ? 'UPDATE':'+ ADD RESERVATION'}}</small>
  </button>
  </div>
  </form>`,
  providers: [ReservationService]
})
export class AddToReservation implements OnInit {
  reservationModel: ReservationModel = new ReservationModel();

  currentUser: User;
  isEvent: any;
  isVip: any;
  constructor(
    private alertService: AlertService,
    public dialogRef: MatDialogRef<AddViewEditDialog>,
    private shared: SharedDataService,
    public tzone: TimeZoneService,
    private reservationService: ReservationService,
    private update: UpdateResultsService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.isEvent = this.data.guestModel.isEvent;
    this.isVip = this.data.guestModel.isVIP;
  }

  addToReservation() {
    this.reservationModel = this.data.guestModel;
    this.reservationModel.isEvent = this.isEvent;
    this.reservationModel.isVIP = this.isVip;
    this.reservationModel.notesToAdd = this.data.guestModel.notes.notes;
    this.reservationModel.customNotes =
      this.data.guestModel.notes.customNotes == ""
        ? null
        : this.data.guestModel.notes.customNotes;

    this.reservationModel.clientID = this.shared.getClientID();
    this.reservationModel.childCovers = this.reservationModel.childCovers
      ? this.reservationModel.childCovers
      : 0;
    if (
      this.data.count > 0 &&
      this.reservationModel.adultCovers + this.reservationModel.childCovers >
        this.data.count
    ) {
      let dialogRef = this.dialog.open(ConfirmDialog, {
        width: "355px",
        disableClose: true,
        data: {
          button: "OK",
          type: "success",
          message:
            "This time slot accommodates a maximum of " +
            this.data.count +
            " guests.Please select a different time slot or revise the number in party."
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.dialogRef.close();
      });
    } else {
      if (this.data.id) {
        this.editReservation();
      } else {
        this.createReservation();
      }
    }
  }

  createReservation() {
    let today = this.tzone.getClientDateTimeWithLTZone(new Date());
    let d = new Date(this.data.date.value),
      t = new Date(this.data.time);
    let reservationTime = new Date(
      d.setHours(t.getHours(), t.getMinutes(), 0, 0)
    );
    this.reservationModel.currentDate = this.tzone.getLocalTimeWithCTZone(
      reservationTime
    );
    this.reservationModel.reservationTime = this.reservationModel.currentDate;
    this.reservationModel.createdDate = this.tzone.getLocalTimeWithCTZone(
      today
    );
    this.reservationService.addReservationData(this.reservationModel).subscribe(
      data => {
        this.update.updateTimeSlots(true);
        this.alertService.success("Reservation details updated successfully.");
        this.dialogRef.close(true);
        this.shared.updateBadger(true);
      },
      error => {
        this.handleErrors(error);
      }
    );
  }

  editReservation() {
    let d = new Date(this.data.date.value);
    let reservationTime = new Date(
      d.setHours(d.getHours(), d.getMinutes(), 0, 0)
    );
    this.reservationModel.currentDate = this.tzone.getLocalTimeWithCTZone(
      reservationTime
    );
    this.reservationModel.reservationTime = this.reservationModel.currentDate;
    this.reservationService.editReservaion(this.reservationModel).subscribe(
      data => {
        this.update.updateReservations(true);
        this.update.updateTimeSlots(true);
        this.alertService.success("Reservation details updated successfully.");
        this.dialogRef.close();
      },
      error => {
        this.handleErrors(error);
      }
    );
  }


  handleErrors(error) {
    if (Array.isArray(error.error.errors)) {
      if (
        error.error.errors[0].field != "Guest.Name" &&
        error.error.errors[0].field != "Guest.Phone"
      ) {
        this.alertService.error(error.error.errors[0].message);
      }
    } else {
      this.alertService.error(error.error.message);
    }
  }
}
