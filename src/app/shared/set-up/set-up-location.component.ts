import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import {
  SharedDataService,
  InitializeService,
  ModuleStatus
} from "../../_services";
import { User } from "../../_models";
import { Router } from "@angular/router";
import { AuthenticationService } from "../../authentication/authentication.service";

export class userPreferenceData {
  remindMeSetupScreen: boolean;
  userID: string;
}

@Component({
  templateUrl: "./set-up-location.component.html",
  styleUrls: ["set-up-location.component.scss"]
})
export class SetUpComponent {
  currentUser: User;
  modules: ModuleStatus;
  remindMeSetupScreen: userPreferenceData = new userPreferenceData();

  constructor(
    public dialogRef: MatDialogRef<SetUpComponent>,
    private shared: SharedDataService,
    private initialize: InitializeService,
    private router: Router,
    private authenticate : AuthenticationService
  ) {
    this.currentUser = this.authenticate.getUser();
    let modules = this.initialize.returnModuleStatus();
    this.modules = modules ? modules : new ModuleStatus();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.getUserPreference();
    this.getModuleStatus();
  }

  getModuleStatus() {
    this.initialize
      .getModuleAccessDetails(this.shared.getClientID())
      .subscribe(data => {
        this.modules = data;
        this.shared.storeModuleStatus(data);
      });
  }

  getUserPreference() {
    this.initialize
      .getUserPreference(this.currentUser.userID)
      .subscribe(data => {
        this.remindMeSetupScreen.remindMeSetupScreen = data.remindMeSetupScreen;
      });
  }

  setUserPreference() {
    this.remindMeSetupScreen.userID = this.currentUser.userID;
    this.shared
      .saveUserPreference(this.remindMeSetupScreen)
      .subscribe(data => {});
  }

  checkModulStatus() {
    if (this.modules.hasModuleTable && this.modules.hasModuleStaff) {
      this.router.navigate(["/dashboard"]);
    } else if (this.modules.hasModuleWaitList) {
      this.router.navigate(["/waitlist"]);
    } else if (this.modules.hasModuleReservations) {
      this.router.navigate(["/reservation"]);
    }
    this.dialogRef.close();
  }
}
