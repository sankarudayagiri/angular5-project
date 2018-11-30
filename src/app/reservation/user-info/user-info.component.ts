import { Component, Input } from "@angular/core";
import { GuestDetails } from "../../_services";

export class UserDetails {
  adultCovers: number = 0;
  childCovers: number = 0;
  guest: GuestDetails = new GuestDetails();
  pagerNumber: number = 0;
}

@Component({
  selector: "user-info",
  templateUrl: "user-info.component.html"
})
export class UserInfoComponent {
  openModal: any;
  @Input()
  userDetails: any;
  @Input()
  type: string;

  edit() {
    this.openModal = true;
  }
}
