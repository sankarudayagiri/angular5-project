import { Component, OnInit, EventEmitter } from "@angular/core";
import {
  AccountSettings,
  AccountSettingService
} from "./account-settings.service";
import {
  AlertService,
  DiscardDialogService,
  LoaderService,
  SharedDataService,
  TimeZoneService,
  UpdateResultsService
} from "../../_services";
import { Observable } from "rxjs";
import { MatSlideToggleChange } from "@angular/material";
import { InitializeService } from "../../_services/initialize.service";
import { User } from "../../_models";
@Component({
  selector: "app-account-settings",
  templateUrl: "./account-settings.component.html",
  styleUrls: ["./account-settings.component.scss"],
  providers: [AccountSettingService, DiscardDialogService]
})
export class AccountSettingsComponent implements OnInit {
  currentUser: User;
  savedata: any;
  account: AccountSettings = new AccountSettings();
  errorMessage: string = null;
  id: string;
  discardConfirm: EventEmitter<boolean> = new EventEmitter();
  showError: boolean = true;
  canLeave: boolean = false;
  constructor(
    private AccountSettingService: AccountSettingService,
    private alertService: AlertService,
    private discardService: DiscardDialogService,
    private loaderService: LoaderService,
    private shared: SharedDataService,
    private initialize: InitializeService,
    public update: UpdateResultsService,
    public tzone: TimeZoneService
  ) {
    this.loaderService.showLoader(true);
    discardService.confirm$.subscribe(confirm => {
      this.discardConfirm.emit(confirm);
    });
  }

  ngOnInit() {
    this.accountSettings();
  }

  accountSettings() {
    this.AccountSettingService.accountSettings(
      this.shared.getClientID()
    ).subscribe(data => {
      data.accountStatus =
        data && data.accountStatus ? JSON.stringify(data.accountStatus) : "0";
      this.account = data ? data : new AccountSettings();
      this.account.hotScheduleShiftCutoffTime = this.tzone.getClientTimeWithCTZone(
        new Date()
      );
      this.savedata = JSON.stringify(this.account);
      this.loaderService.showLoader(false);
    });
  }

  tableStaffToggle(event: MatSlideToggleChange) {
    if (event.checked) {
      this.account.hasModuleTable
        ? (this.account.hasModuleStaff = true)
        : (this.account.hasModuleTable = true);
      !this.account.hasModuleWaitList
        ? this.account.hasModuleReservations
          ? this.account.hasModuleReservations
          : (this.account.hasModuleWaitList = true)
        : this.account.hasModuleWaitList;
    } else {
      !this.account.hasModuleTable
        ? (this.account.hasModuleStaff = false)
        : (this.account.hasModuleTable = false);
    }
  }

  waitlistReservationToggle(value, moduleName) {
    if (this.account.hasModuleTable && this.account.hasModuleStaff && value) {
      if (moduleName == "hasModuleWaitList") {
        this.account.hasModuleReservations = true;
      } else {
        this.account.hasModuleWaitList = true;
      }
    }
  }

  tapahead(event: MatSlideToggleChange){
    if(!event.checked){
        this.account.hasModuleWaitList?  this.account.hasModuleWaitList = false: this.account.hasModuleWaitList;
    }
  }

  scrolltoTop(f) {
    if (!f) window.scroll(0, 0);
  }

  save() {
    this.loaderService.showLoader(true);
    this.account.clientID = this.shared.getClientID();
    this.savedata = JSON.stringify(this.account);
    this.AccountSettingService.saveAccountSettings(this.account).subscribe(
      data => {
        this.alertService.success("Account Settings saved successfully.");
        this.loaderService.showLoader(false);
        this.getModuleAccessDetails();
      },
      error => {
        this.alertService.error(error.error.message);
        this.loaderService.showLoader(false);
      }
    );
  }

  getModuleAccessDetails() {
    this.initialize.getModuleStatus(this.shared.getClientID());
  }

  // check for unsaved changes
  canDeactivate(): Observable<boolean> | boolean {
    let dataNotChanged = this.savedata === JSON.stringify(this.account);
    if (dataNotChanged) return true;
    this.discardService.openDiscardChangesDialog();
    return this.discardConfirm;
  }

  checkForZero(event) {
    this.account.accountBaseAmount =
      event.target.value == 0 && event.target.value.length == 1
        ? null
        : event.target.value;
  }

  updateBaseAmountOnBlur() {
    let val = this.account.accountBaseAmount;
    this.account.accountBaseAmount = val ? val : 0;
  }
}
