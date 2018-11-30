import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import "rxjs/add/observable/interval";
import { AlertService, SharedDataService } from "../_services/index";
import { AuthenticationService } from "./authentication.service";
import { Observable } from "rxjs/Observable";
import { MatDialog } from "@angular/material";
import { NotesReminderDialogComponent } from "../shared/notes-reminder-dialog/notes-reminder-dialog.component";
import { InitializeService } from "../_services/initialize.service";
import { ResetPasswordComponent } from "./reset-password.component";
import { SetUpComponent } from "../shared/set-up/set-up-location.component";

export class loginModel {
  username: string;
  password: string;
}
export class resetPasswordModel {
  username: string;
}
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  model: loginModel = new loginModel();
  loading = false;
  returnUrl: string;
  superAdmin: boolean;
  clientAdmin: boolean;
  multiUnitAdmin: boolean;
  host: boolean;
  sessionExpired: boolean = false;
  invalidCredentials: boolean = false;
  errorMessages: any[] = [];
  matCustomError: string;
  error: string;
  notes: any;
  invalid: boolean = false;
  resetPasswordError: boolean = false;
  resetPasswordModel: resetPasswordModel = new resetPasswordModel();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private shared: SharedDataService,
    private initialize: InitializeService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    // reset login status
    let user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
      this.authenticationService.logout(user.UserName).subscribe(() => {
        localStorage.removeItem("currentUser");
        sessionStorage.clear();
      });
    }
    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams["returnUrl"] || "/super-admin";
    this.sessionExpired = this.route.snapshot.queryParams["returnUrl"]
      ? true
      : false;
  }

  login() {
    this.loading = true;
    this.authenticationService
      .login(this.model.username, this.model.password)
      .subscribe(
        data => {
          if (data.token) {
            this.superAdmin = data.role === "JtechAdmin" ? true : false;
            this.clientAdmin = data.role === "ClientAdmin" ? true : false;
            this.multiUnitAdmin = data.role === "MultiUnitAdmin" ? true : false;
            this.host = data.role === "Host" ? true : false;

            this.returnUrl = this.superAdmin
              ? "/jtech-admin"
              : this.clientAdmin
                ? "/admin"
                : this.multiUnitAdmin
                  ? "/admin"
                  : "/dashboard";

            if (this.clientAdmin) {
              this.router.navigate([this.returnUrl]);
              this.getUserPreference(data.userID);
              var sub = Observable.interval(600000).subscribe(val => {
                this.getActiveNoteReminders();
              });
            } else if (this.host) {
              this.initialize
                .getModuleAccessDetails(data.clientID)
                .subscribe(data => {
                  this.shared.storeModuleStatus(data);
                  this.checkModulStatus(data);
                });
            } else {
              this.router.navigate([this.returnUrl]); // CLEANUP
            }
          } else {
            this.invalidCredentials = true;
            this.loading = false;
          }
        },
        error => {
          this.invalid = true;
          this.resetPasswordError = false;
          this.alertService.error(error);
          this.loading = false;
          //this.errorMessages = error.error.errors;
        }
      );
  }

  checkModulStatus(data) {
    if (data.hasModuleTable && data.hasModuleStaff) {
      this.router.navigate(["/dashboard"]);
    } else if (data.hasModuleWaitList) {
      this.router.navigate(["/waitlist"]);
    } else if (data.hasModuleReservations) {
      this.router.navigate(["/reservation"]);
    } else {
      this.router.navigate([this.returnUrl]);
    }
  }

  getUserPreference(userID) {
    this.initialize.getUserPreference(userID).subscribe(data => {
      if (data.remindMeSetupScreen) {
        this.router.navigate([this.returnUrl]);
        this.goToSetUpScreen();
      }
    });
  }

  goToSetUpScreen(): void {
    this.dialog.open(SetUpComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { type: 0 }
    });
  }

  getActiveNoteReminders() {
    this.shared
      .getActiveNoteReminders(this.shared.getClientID())
      .subscribe(data => {
        this.notes = data;
        if (data.length > 0) {
          this.notesReminder(this.notes);
        }
      });
  }

  notesReminder(data) {
    for (let i = 0; i < data.length; i++) {
      this.dialog.open(NotesReminderDialogComponent, {
        width: "445px",
        data: {
          data: data[i].note,
          id: data[i].id
        }
      });
    }
  }

  forgotPassword() {
    this.loading = true;
    if (this.model.username) {
      this.resetPasswordModel.username = this.model.username;
      this.authenticationService
        .resetPassword(this.resetPasswordModel)
        .subscribe(data => {
          this.openResetPasswordModal(data);
          this.loading = false;
        });
    } else {
      this.resetPasswordError = true;
      this.loading = false;
    }
  }

  openResetPasswordModal(data) {
    this.dialog.open(ResetPasswordComponent, {
      width: "445px",
      data: {
        data
      }
    });
  }
}
