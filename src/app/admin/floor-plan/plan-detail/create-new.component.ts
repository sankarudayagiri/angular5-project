import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  template: `<h1 mat-dialog-title>Create New Map</h1>
  <form name="form" (ngSubmit)="f.form.valid && dialogRef.close(data.name) " #f="ngForm" novalidate>
  <div mat-dialog-content>
    <mat-form-field>
      <input placeholder="Enter Floor Plan name." name="floor-plan-name" maxlength="20" class="text-uppercase" matInput cdkFocusInitial [(ngModel)]="data.name">
    </mat-form-field>
  </div>

  <div mat-dialog-actions class="text-right">
    <button class="btn btn-outline-primary mr-2" type="button" (click)="onNoClick()" [routerLink]="['/admin/floor-plan/plans']">CANCEL</button>
    <button class="btn btn-primary" type="button" [disabled]="!data.name" [mat-dialog-close]="data.name">CREATE</button>
  </div>
  </form>
  `
})
export class CreateNewMapDialog {
  constructor(
    public dialogRef: MatDialogRef<CreateNewMapDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.data.name = "";
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
