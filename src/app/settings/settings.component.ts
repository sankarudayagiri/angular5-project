import { Component, OnInit } from "@angular/core";
import {
  SettingsService,
  Panels,
  Palettes,
  seatThresholds,
  RemindMeSetupScreen
} from "./settings.service";
import {
  LoaderService,
  AlertService,
  SharedDataService,
  ModuleStatus
} from "./../_services/index";
import { ConfirmDialog } from "../shared";
import { MatDialog } from "@angular/material";
import { InitializeService } from "../_services/initialize.service";
import { User } from "../_models";
import { SetUpComponent } from "../shared/set-up/set-up-location.component";
import { AuthenticationService } from "../authentication/authentication.service";

@Component({
  selector: "app-settings",
  templateUrl: "settings.component.html",
  styleUrls: ["settings.component.scss"]
})
export class SettingsComponent implements OnInit {
  currentUser: User;
  settings: RemindMeSetupScreen = new RemindMeSetupScreen();
  panels: Panels = new Panels();
  colourPalettes: Palettes = new Palettes();
  thresholds: seatThresholds[] = [];
  showDeleteID: number;
  quotedWaitTime: any;
  showError: boolean = false;
  thresholdTimeError: boolean = false;
  showHeader: boolean;
  modules: ModuleStatus = new ModuleStatus();

  constructor(
    private SettingsService: SettingsService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private shared: SharedDataService,
    private initialize: InitializeService,
    public dialog: MatDialog,
    private authenticate : AuthenticationService
  ) {
    this.loaderService.showLoader(true);
    this.currentUser = this.authenticate.getUser();

    if (this.currentUser.role == "Host") {
      this.showHeader = true;
    } else {
      this.showHeader = false;
    }
  }

  ngOnInit() {
    this.modules = this.initialize.returnModuleStatus();
    this.getUserPreferences();
    this.getAdminPreferences();
  }

  goToSetUpScreen(): void {
    this.dialog.open(SetUpComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { type: 0 }
    });
  }

  getUserPreferences() {
    this.initialize.getUserPreference(this.currentUser.userID).subscribe(
      data => {
        this.panels = data.panels;
        this.panels.isStatusBarReservationVisible = this.modules
          .hasModuleReservations
          ? this.panels.isStatusBarReservationVisible
          : false;
        this.panels.isStatusWaitlistVisible = this.modules.hasModuleWaitList
          ? this.panels.isStatusWaitlistVisible
          : false;
        this.panels.showReservationList = this.modules.hasModuleReservations
          ? this.panels.showReservationList
          : false;
        this.panels.showWaitlist = this.modules.hasModuleWaitList
          ? this.panels.showWaitlist
          : false;
        this.colourPalettes = data.colourPalettes;
        this.loaderService.showLoader(false);
      },
      error => {
        this.loaderService.showLoader(false);
      }
    );
  }

  getAdminPreferences() {
    this.SettingsService.getAdminPreference(
      this.shared.getClientID()
    ).subscribe(data => {
      this.thresholds = data.seatThresholds;
      for (var x in this.thresholds) {
        if (
          (this.thresholds[x].covers == 0 &&
            this.thresholds[x].threshold == 0) ||
          (this.thresholds[x].covers != null &&
            this.thresholds[x].threshold == 0) ||
          (this.thresholds[x].covers == 0 &&
            this.thresholds[x].threshold != null) ||
          (this.thresholds[x].covers != null &&
            this.thresholds[x].threshold == null)
        ) {
          this.thresholds.splice(
            this.thresholds.indexOf(this.thresholds[x]),
            1
          );
          // this.showError=false;
          // }
          this.loaderService.showLoader(false);
        }
      }
      this.loaderService.showLoader(false);
    });
  }

  createNew() {
    let threshold = new seatThresholds();
    var isEmpty = [];

    for (var x in this.thresholds) {
      if (
        this.thresholds[x].covers != 0 &&
        this.thresholds[x].covers != null &&
        (this.thresholds[x].threshold != 0 &&
          this.thresholds[x].threshold != null)
      ) {
        isEmpty.push(1);
        this.showError = false;
      } //End of If
      else {
        this.showError = true;
        isEmpty.push(0);
      }
    } //End of For

    if (!isEmpty.includes(0)) {
      this.thresholds.push(threshold);
    }
  }

  toggleStatusBar() {
    if (this.panels.isStatusBarVisible) {
      this.panels.isStatusBarClockVisible = true;
      this.panels.isStatusBarReservationVisible = this.modules
        .hasModuleReservations
        ? true
        : false;
      this.panels.isStatusWaitlistVisible = this.modules.hasModuleWaitList
        ? true
        : false;
    } else {
      this.panels.isStatusBarClockVisible = false;
      this.panels.isStatusBarReservationVisible = false;
      this.panels.isStatusWaitlistVisible = false;
    }
  }

  updateStatusBar() {
    if (
      !this.panels.isStatusBarClockVisible &&
      !this.panels.isStatusBarReservationVisible &&
      !this.panels.isStatusWaitlistVisible
    ) {
      this.panels.isStatusBarVisible = false;
    } else {
      this.panels.isStatusBarVisible = true;
    }
  }

  saveUserPreferences() {
    let model: any = {};
    model.userID = this.currentUser.userID;
    model.panels = this.panels;
    model.colourPalettes = this.colourPalettes;
    this.loaderService.showLoader(true);
    this.SettingsService.saveUserPreference(model).subscribe(
      data => {
        this.loaderService.showLoader(false);
        this.alertService.success("User Preferences saved successfully.");
      },
      error => {
        this.alertService.error(error.error.message);
        this.loaderService.showLoader(false);
      }
    );
  }

  saveAdminPreferences() {
    let model: any = {};
    let newmodel: any = [];

    for (var x in this.thresholds) {
      if (this.thresholds[x].covers > 0 && this.thresholds[x].threshold > 0) {
        newmodel.push({
          covers: this.thresholds[x].covers,
          threshold: this.thresholds[x].threshold
        });
      } else {
        this.thresholds.splice(this.thresholds.indexOf(this.thresholds[x]), 1);
        this.showError = false;
      }
    }
    model.clientID = this.shared.getClientID();
    model.seatThresholds = newmodel;
    this.loaderService.showLoader(true);
    this.SettingsService.saveAdminPreference(model).subscribe(
      data => {
        this.loaderService.showLoader(false);
        this.alertService.success("Admin Preferences saved successfully.");
      },
      error => {
        if (Array.isArray(error.error.errors)) {
          this.alertService.error(error.error.errors[0].message);
        } else {
          this.alertService.error(error.error.message);
        }

        this.loaderService.showLoader(false);
      }
    );
  }

  delete(index) {
    this.thresholds.splice(index, 1);
    this.showDeleteID = null;
  }

  confirmDelete(index) {
    if (
      this.thresholds[index].threshold > 0 &&
      this.thresholds[index].covers > 0
    ) {
      this.showError = false;
      let dialogRef = this.dialog.open(ConfirmDialog, {
        width: "300px",
        disableClose: true,
        data: {
          button: "Confirm",
          type: "danger",
          message:
            "Delete  Turn Time " +
            this.thresholds[index].threshold +
            " for  Table Size " +
            this.thresholds[index].covers +
            "? This operation cannot be undone."
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) this.delete(index);
      });
    } else {
      this.showError = false;
      this.delete(index);
    }
  }

  //applying theme
  applyTheme(theme) {
    this.colourPalettes.primaryColour = theme == "dark" ? "dark" : "light";
    this.colourPalettes.secondaryColour = null;
  }

  scrolltoTop(f) {
    if (!f) window.scroll(0, 0);
  }

  validateKey(e) {
    if (e.key != "") this.showError = false;
  }
}
