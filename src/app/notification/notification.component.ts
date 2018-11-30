import { Component, Input } from "@angular/core";
import { NotificationService, NotificationList } from "./notification.service";
import { SharedDataService } from "../_services";

@Component({
  selector: "app-notification",
  templateUrl: "notification.component.html",
  styleUrls: ["./notification.component.scss"],
  providers: [NotificationService]
})
export class NotificationComponent {
  @Input("panelClass")
  panelClass;
  @Input()
  openPanel;
  notificationData: any;
  notification: NotificationList = new NotificationList();
  public today : Date  = new Date();

  constructor(
    private DataService: NotificationService,
    private shared: SharedDataService
  ) {}

  ngOnChanges() {
    if (this.openPanel) {
      this.getNotification();
      // this.shared.updateBadger(true);
    }
  }

  getNotification() {
    this.notification.clientID = this.shared.getClientID();
    this.DataService.postNotificationList(this.notification).subscribe(data => {
      this.notificationData = data;
    });
  }
}
