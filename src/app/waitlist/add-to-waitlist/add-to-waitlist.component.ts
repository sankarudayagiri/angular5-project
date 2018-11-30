import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material";
import {
  AlertService,
  SharedDataService,
  TimeZoneService
} from "../../_services";
import { WaitlistAddViewEditDialog } from "../add-view-edit-dialog.component";
import { WaitlistService, WaitlistModel } from "../waitlist.service";
import { FilterPipe } from "../../_pipes";
import { UpdateResultsService } from "../../_services/update-results.service";

@Component({
  selector: "add-edit-waitlist",
  template: `
  <form name="form" #f="ngForm" novalidate class="dialog-scrollable-content">
  <div class="row text-center mt-4 justify-content-center">
    <div class="col-8">
      <div class="row justify-content-center">
        <div class="col-3">
          <h6 class="text-muted text-uppercase"><small>Quote Time</small></h6>
          <number-stepper  class="waitlist" [required]="true" name="quoted-time" [step]="5" [(modelValue)]="quotedWaitTime" [minValue]="0" [maxValue]="999"></number-stepper>
          <div *ngIf="quotedWaitTimeError" [hidden]="quotedWaitTime>0" class="help-block text-danger custom-validator"><small>Quoted Time is Required</small></div>
          </div>
        <div class="col-3 d-flex align-items-center justify-content-center">
          <mat-slide-toggle name="waitlist-type" class="mt-2 toggle-warning" [(ngModel)]="waitlistType">CALL AHEAD</mat-slide-toggle>
        </div>
      </div>
    </div>
    <div class="col-12"><hr/></div>
  </div>
  <add-guest [parent]="'waitlist'"></add-guest>
  <div class="text-center dialog-footer">
    <button class="btn btn-lg btn-waitlist" (click)="data.guestModel.adultCovers && data.guestModel.guest.name && (data.guestModel.guest.phone && data.guestModel.guest.phone.length >= 7 || !data.guestModel.guest.phone) && quotedWaitTimefnc() && addToWaitList()">
    <small>{{data.type == 2 ? 'UPDATE':'+ ADD PARTY TO WAIT LIST'}}</small>
    </button>
  </div>
  </form>`,
  providers: [WaitlistService, FilterPipe],
  styleUrls: ["./add-to-waitlist.component.scss"]
})
export class AddToWaitlistComponent implements OnInit {
  waitlistModel: WaitlistModel = new WaitlistModel();
  waitlistType: any;
  quotedWaitTime: any;
  quotedWaitTimeError: boolean = false;
  priority: number = 3;

  constructor(
    private alertService: AlertService,
    public dialogRef: MatDialogRef<WaitlistAddViewEditDialog>,
    private waitlistService: WaitlistService,
    private shared: SharedDataService,
    private update: UpdateResultsService,
    public tzone: TimeZoneService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.waitparty) {
      if (this.data.waitparty.waitListType.id == 2) {
        this.waitlistType = true;
      }
    } else {
      this.waitlistType = false;
    }
  }

  ngOnInit() {
    this.quotedWaitTime = this.data.waitparty
      ? this.getTimeInMins(this.data.waitparty.quotedWaitTime)
      : this.getTimeInMins(this.data.avgTime);
  }

  quotedWaitTimefnc() {
    if (this.quotedWaitTime > 0) {
      return true;
    } else {
      this.quotedWaitTimeError = true;
    }
  }
  getTimeInMins(stringtime) {
    let time: string = stringtime;
    let parts = time.match(/(\d+):(\d+)/);
    let hours = parseInt(parts[1]),
      minutes = parseInt(parts[2]);
    return hours * 60 + minutes;
  }

  addToWaitList() {
    this.waitlistModel = this.data.guestModel;
    this.waitlistModel.waitListID = this.data.waitListID;
    this.waitlistModel.customNotes =
      this.data.guestModel.notes.customNotes == ""
        ? null
        : this.data.guestModel.notes.customNotes;
    this.waitlistModel.priorityID = "3";
    this.waitlistModel.waitListTypeID = this.waitlistType ? "2" : "1";
    this.waitlistModel.notesToAdd = this.data.guestModel.notes.notes;
    this.waitlistModel.quotedWaitTime = this.getQuotedWaitTime();
    this.waitlistModel.clientID = this.shared.getClientID();
    this.waitlistModel.childCovers = this.waitlistModel.childCovers
      ? this.waitlistModel.childCovers
      : 0;
    if (this.data.id) {
      this.editWaitlist();
    } else {
      this.createWaitlist();
    }
  }

  createWaitlist() {
    this.waitlistModel.createdDate = this.tzone.getClientTimeWithCTZone(
      new Date()
    );
    this.waitlistService.addToWaitList(this.waitlistModel).subscribe(
      data => {
        // this.update.updateWaitlist(true);
        this.alertService.success("Party added to Wait List successfully.");
        this.dialogRef.close(true);
        this.shared.updateBadger(true);
      },
      error => {
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
        // this.alertService.error(error.error.message);
      }
    );
  }

  getQuotedWaitTime() {
    let qm = this.quotedWaitTime;
    let h = Math.floor(Number(qm) / 60),
      m = Math.floor(Number(qm) % 60),
      time = h + ":" + m;
    return time;
  }

  editWaitlist() {
    delete this.waitlistModel.waitListType;
    this.waitlistModel.waitListDataID = this.data.id;
    this.waitlistModel.priorityID = this.data.waitparty.priority
      ? this.data.waitparty.priority.id
      : this.waitlistModel.priorityID;
    this.waitlistService.editWaitlist(this.waitlistModel).subscribe(
      data => {
        this.update.updateWaitlist(true);
        this.alertService.success("Party details updated successfully");
        this.dialogRef.close();
      },
      error => {
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
    );
  }
}
