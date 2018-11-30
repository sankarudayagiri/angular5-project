import { Component, OnInit } from "@angular/core";
import { SharedDataService } from "../../../_services";
import { ServerFeedbackService } from "./server-ratings.services";

@Component({
  selector: "app-server-ratings",
  templateUrl: "./server-ratings.component.html",
  styleUrls: ["./server-ratings.component.scss"],
  providers: [ServerFeedbackService]
})
export class ServerRatingsComponent implements OnInit {
  servers: any;
  serverratings: any;

  constructor(
    private shared: SharedDataService,
    private ServerFeedbackService: ServerFeedbackService
  ) {}

  ngOnInit() {
    this.getFiveTopServers();
    this.getFiveBottomServers();
  }

  getFiveTopServers() {
    this.ServerFeedbackService.getFiveTopServers(
      this.shared.getClientID()
    ).subscribe(data => {
      this.servers = data;
    });
  }

  getFiveBottomServers() {
    this.ServerFeedbackService.getFiveBottomServers(
      this.shared.getClientID()
    ).subscribe(data => {
      this.serverratings = data;
    });
  }
}
