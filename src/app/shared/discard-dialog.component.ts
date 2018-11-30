import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  template: `<h2 mat-dialog-title>Unsaved Changes</h2>
    <div mat-dialog-content>
      <p>You have unsaved changes. Are you sure you want to leave this page?</p>
    </div>
    <div mat-dialog-actions class="text-center">
      <button class="btn btn-outline-primary mr-2" [mat-dialog-close]="true">LEAVE</button>
      <button class="btn btn-primary" [mat-dialog-close]="false">STAY</button>
    </div>`
})
export class DiscardChangesDialog {
  constructor(
    public dialogRef: MatDialogRef<DiscardChangesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
