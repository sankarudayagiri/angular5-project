import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  template: `<div class="row">
  <div class="p-3">
      <p *ngIf="data.message" [innerHTML]="data.message"></p>
      <div class="d-flex justify-content-sm-center mt-4">
          <button class="btn btn-primary" (click)="onNoClick()">
          <span *ngIf="data.cancelBtn">Cancel</span>
          <span *ngIf="!data.cancelBtn">Cancel</span>
          </button>
          <button *ngIf="data.button" class="btn ml-2" [ngClass]="{'btn-success' : data.type == 'success', 'btn-danger' : data.type == 'danger'}"  (click)="confirm()">{{data.button}}</button>
          <button *ngIf="data.optionalBtn" class="btn btn-outline-primary ml-2" (click)="optional()">{{data.optionalBtn}}</button>
      </div>
  </div>
</div>`
})
export class ConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close(true);
  }

  optional() {
    this.dialogRef.close("optional");
  }
}
