import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
//import { environment } from "../../../../environments/environment";

export class SaveFeedback {
  guestID: string;
  ambienceRating: 0;
  foodRating: 0;
  feedbackText: string;
  serverID: string;
  serverRating: 0;
  guestName: string;
  createdDateTime: Date = new Date();
  guestVisitsID: string;
}

@Injectable()
export class FeedbackService {
  constructor(private http: HttpClient) {}

  // getGuestFeedback(clientid: string) {
  //   return this.http.get<any>(
  //     environment.API + "/Guest/getguestfeedback/" + clientid
  //   );
  // }

  // saveFeedback(model) {
  //   return this.http.post<any>(environment.API + "/Guest/savefeedback", model);
  // }
}
