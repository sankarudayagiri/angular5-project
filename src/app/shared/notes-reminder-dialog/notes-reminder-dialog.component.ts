import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

import { SharedDataService } from "../../_services/shared-data.service";
import { AlertService } from "../../_services/alert.service";

@Component({
  selector: "notes-reminder",
  templateUrl: "notes-reminder-dialog.component.html",
})
export class NotesReminderDialogComponent {
  constructor(
    private dataService: SharedDataService,
    public dialogRef: MatDialogRef<NotesReminderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public alertService: AlertService
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  noteRead(id) {
    this.dataService.updateNotesStatus(id).subscribe(data => {
      this.alertService.success("Successfully Updated The Notes Status");
      this.dialogRef.close();
    });
  }
}
