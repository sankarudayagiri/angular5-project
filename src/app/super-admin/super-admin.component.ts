import { Component } from "@angular/core";
import { User } from "../_models/index";
import { AuthenticationService } from "../authentication/authentication.service";

@Component({
  template: `<router-outlet></router-outlet>`
})
export class SuperAdminComponent {
  currentUser: User;

  constructor(private authenticate  :AuthenticationService) {
    this.currentUser = this.authenticate.getUser();
  }
}
