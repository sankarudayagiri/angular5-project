import { Component } from "@angular/core";
import { AdminHeaderService } from "../admin-header/admin-header.service";
import {
  SharedDataService,
  ModuleStatus,
  UpdateResultsService
} from "../../_services";
import { InitializeService } from "../../_services/initialize.service";
import { User } from "../../_models";
import { AuthenticationService } from "../../authentication/authentication.service";

@Component({
  templateUrl: "./setting-cards.component.html",
  styleUrls: ["./setting-cards.component.scss"]
})
export class SettingCardsComponent {
  currentUser: User;
  modules: ModuleStatus = new ModuleStatus();

  constructor(
    private AdminHeaderService: AdminHeaderService,
    private initialize: InitializeService,
    public shared: SharedDataService,
    public authenticate : AuthenticationService
  ) {
    this.AdminHeaderService.showAdminHeader(true);
    this.shared.showSideBar(true);
    this.currentUser = this.authenticate.getUser();

    initialize.updateModuleStatus$.subscribe(() => {
      this.modules = this.initialize.returnModuleStatus();
    });
  }

  ngOnInit() {
    this.modules = this.initialize.returnModuleStatus();
  }
}
