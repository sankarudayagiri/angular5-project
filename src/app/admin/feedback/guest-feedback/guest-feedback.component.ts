import { Component, OnInit } from "@angular/core";
import { FeedbackService, SaveFeedback } from "./guest-feedback.service";
import { SharedDataService } from "../../../_services";

@Component({
  selector: "app-guest-feedback",
  templateUrl: "./guest-feedback.component.html",
  styleUrls: ["./guest-feedback.component.scss"],
  providers: [FeedbackService]
})
export class GuestFeedbackComponent implements OnInit {
  feedback: SaveFeedback = new SaveFeedback();
  guests: any;

  constructor(
    private FeedbackService: FeedbackService,
    private shared: SharedDataService
  ) {}

  ngOnInit() {
    this.getGuestFeedback();
  }

  getGuestFeedback() {
    this.FeedbackService.getGuestFeedback(this.shared.getClientID()).subscribe(
      data => {
        this.guests = data;
      }
    );
  }


  //RE VISIT THIS METHOD
  saveFeedback() {
    this.FeedbackService.saveFeedback(this.feedback).subscribe(data => {});
  }
}
