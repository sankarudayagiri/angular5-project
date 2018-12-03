import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
//import { environment } from "../../environments/environment";

export class Reminder {
  note: string;
  status: boolean = true;
  fromDate: Date = new Date();
  toDate: Date = new Date();
  clientID: string = "";
}

export class AddNotes {
  note: string = null;
  addedAt: string;
  clientID: string;
}
export class NotesByDay {
  date:  string;
  clientID: string;
}

@Injectable()
export class NotesService {
  constructor(private http: HttpClient) {}

  openNotesPanel: boolean = false;

  // postNotes(model) {
  //   return this.http.post<any>(environment.API + "/Notes/handover/add", model);
  // }

  // postNotesByDay(model) {
  //   return this.http.post<any>(
  //     environment.API + "/Notes/handover/listbyday",
  //     model
  //   );
  // }

  // addReminder(model) {
  //   return this.http.post<any>(environment.API + "/Notes/reminder", model);
  // }
}
