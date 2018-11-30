import { Component, Input, Inject } from "@angular/core";
import { NotesService, AddNotes, NotesByDay, Reminder } from "./notes.service";
import { AlertService, SharedDataService, TimeZoneService } from "../_services";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "app-notes",
  templateUrl: "notes.component.html",
  styleUrls: ["./notes.component.scss"],
  providers: [NotesService]
})
export class NotesComponent {
  @Input("notesPanelClass")
  notesPanelClass;
  @Input()
  openPanel;

  notes: AddNotes = new AddNotes();
  date: NotesByDay = new NotesByDay();
  displayNotes: any;
  error: boolean = false;
  timezone: string;

  constructor(
    private DataService: NotesService,
    public dialog: MatDialog,
    private alertService: AlertService,
    private shared: SharedDataService,
    public tzone: TimeZoneService
  ) {
    this.timezone = this.tzone.getSavedClientTimeZone();
  }

  ngOnChanges() {
    if (this.openPanel) {
      this.getNotes();
      this.notes.note = null;
      this.error = false;
    }
  }

  getNotes() {
    this.date.clientID = this.shared.getClientID();
    this.date.date = this.tzone.getClientTimeWithCTZone(new Date());
    this.DataService.postNotesByDay(this.date).subscribe(data => {
      this.displayNotes = data;
    });
  }

  sendMsg() {
    this.notes.clientID = this.shared.getClientID();
    this.notes.addedAt = this.tzone.getClientTimeWithCTZone(new Date());
    this.DataService.postNotes(this.notes).subscribe(data => {
      this.alertService.success("Successfully sent the note");
      // this.shared.updateBadger(true);
      this.getNotes();
    });
    this.notes.note = null;
  }

  setReminder() {
    if (this.notes.note) {
      let dialogRef = this.dialog.open(NotesReminderComponent, {
        width: "100vw",
        panelClass: "full-size-dialog",
        data: { notes: this.notes.note }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // this.sendMsg();
        }
      });
    } else {
      this.error = true;
    }
  }
}

@Component({
  selector: "app-notes-reminder",
  templateUrl: "notes-reminder.component.html",
  providers: [NotesService]
})
export class NotesReminderComponent {
  public exportTime: Date = new Date();
  public minDate: Date = new Date();
  public errorTime: boolean = false;
  public selectedDate: Date = new Date();
  public notesReminder: Reminder = new Reminder();

  constructor(
    private DataService: NotesService,
    public dialogRef: MatDialogRef<NotesReminderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private alertService: AlertService,
    private shared: SharedDataService,
    public tzone: TimeZoneService
  ) {
    this.exportTime = this.tzone.getClientDateTimeWithLTZone(new Date());
    this.selectedDate = this.tzone.getClientDateTimeWithLTZone(new Date());
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  convertDate() {
    var time = this.exportTime.toTimeString();
    var date = this.selectedDate.toDateString();
    var dt = date + "," + time;
    this.notesReminder.toDate = new Date(dt);
  }

  checktime() {
    this.convertDate();
    let currentTime = this.tzone
      .getClientDateTimeWithLTZone(new Date())
      .getTime();
    let selectedTime = this.notesReminder.toDate.getTime();
    this.errorTime = currentTime > selectedTime ? true : false;
  }

  addReminder() {
    this.convertDate();
    this.notesReminder.note = this.data.notes;
    this.notesReminder.fromDate = new Date();
    this.notesReminder.clientID = this.shared.getClientID();
    this.DataService.addReminder(this.notesReminder).subscribe(() => {
      this.alertService.success("Successfully added reminder to note");
      this.dialogRef.close(true);
    });
  }
}
