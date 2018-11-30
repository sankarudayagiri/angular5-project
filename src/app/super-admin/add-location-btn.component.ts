import { Component, EventEmitter, Output, Input } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import {
  SharedDataService,
  SessionService,
  InitializeService
} from "../_services";
import { AddClientLocationComponent } from "../shared/add-client-location/add-client-location.component";
import { ConfirmDialog } from "../shared";
import { User } from "../_models";
import { AuthenticationService } from "../authentication/authentication.service";

@Component({
  selector: "add-location-btn",
  template: `
    <button class="btn btn-lg btn-primary ml-4 font-weight-normal" (click)="addLocation()">
      + ADD LOCATION
    </button>`,
  styles: [
    `
      .btn {
        font-size: 15px;
      }
    `
  ]
})
export class AddLocationBtnComponent {
  public currentUser: User;
  @Input()
  parent: string;
  @Output()
  locationAddedChange: EventEmitter<boolean> = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private sessionStorage: SessionService,
    private shared: SharedDataService,
    private initialize: InitializeService,
    private authenticate  :AuthenticationService
  ) {
    this.currentUser = this.authenticate.getUser();
  }

  addLocation(): void {
    let dialogRef = this.dialog.open(AddClientLocationComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { type: 0 }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmNavigateToNewAccount(result.data.id);
        this.locationAddedChange.emit(true);
      }
    });
  }

  confirmNavigateToNewAccount(clientID: string) {
    let message =
      this.parent == "search"
        ? "Successfully added new Account. Want to Manage you Added?"
        : "Dou you want to Leave this Account and Manage new you Added?";
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "400px",
      disableClose: true,
      data: {
        button: "YES",
        //optionalBtn: "OPEN IN NEW TAB",
        type: "success",
        message: message
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      let currentSession = this.shared.getClientID();
      if (result == "optional") {
        this.sessionStorage.storeSessionClientID(clientID);
        let baseUrl = window.location.origin,
          url = baseUrl + "/#/admin/settings",
          newtab = window.open(url, "_blank");
        setTimeout(() => {
          this.sessionStorage.storeSessionClientID(currentSession);
        }, 1500);
        if (newtab == null) {
          return true;
        }
        return false;
      } else if (result && result != "optional") {
        this.shared.clearSessions();
        this.sessionStorage.storeSessionClientID(clientID);
        if (this.parent == "search") {
          this.router.navigate(["/admin/settings"]);
        } else {
          this.loadAccount();
        }
      }
    });
  }

  loadAccount() {
    setTimeout(() => {
      this.initialize.initializeLocation(
        this.shared.getClientID(),
        this.currentUser.userID,
        this.currentUser.role
      );
    });
  }
}
