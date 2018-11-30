import { Component, Input } from "@angular/core";
import { MatDialog } from "@angular/material";
import { AddViewEditDialog } from "./add-view-edit-dialog.component";
import { FormControl } from "@angular/forms";
import {
  UpdateResultsService,
  SharedDataService,
  TimeZoneService
} from "../_services";

@Component({
  selector: "add-reservation-btn",
  template: `<button *ngIf="size == null" mat-fab color="primary" class="mx-2 pull-right" matTooltip="Add New Reservation" (click)="addPartyToReservation()">
  <mat-icon>add</mat-icon>
</button>
<button *ngIf="size == 'mini'" mat-mini-fab color="primary" class="mx-2 pull-right" matTooltip="Add New Reservation" (click)="addPartyToReservation()">
  <mat-icon>add</mat-icon>
</button>`
})
export class AddReservationBtnComponent {
  date = new FormControl();
  @Input()
  size: string = null;
  constructor(
    public dialog: MatDialog,
    private update: UpdateResultsService,
    private shared: SharedDataService,
    public tzone: TimeZoneService
  ) {
    this.date = new FormControl(
      this.tzone.getClientDateTimeWithLTZone(new Date())
    );
  }

  //addParty dialog
  addPartyToReservation(): void {
    let dialogRef = this.dialog.open(AddViewEditDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { view: "calendar-add", date: this.date }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.update.updateReservations(true);
      }
    });
  }
}
