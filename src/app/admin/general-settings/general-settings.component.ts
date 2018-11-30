import { Component, OnInit, EventEmitter } from "@angular/core";
import {
  GeneralSettingsService,
  GeneralSettingsData
} from "./general-settings.service";
import {
  AlertService,
  DiscardDialogService,
  LoaderService,
  SharedDataService,
  TimeZoneService
} from "../../_services";
import { FilterPipe } from "../../_pipes";
import * as _ from "underscore";
import { Observable } from "rxjs";
import { JtechAdminService } from "../../super-admin/search/search.service";
import { ClientAdminHeaderService } from "../../shared/client-admin-header.service";
import { InitializeService } from "../../_services/initialize.service";
import { User } from "../../_models";

@Component({
  templateUrl: "./general-settings.component.html",
  providers: [
    GeneralSettingsService,
    FilterPipe,
    DiscardDialogService,
    JtechAdminService
  ],
  styleUrls: ["./general-settings.component.scss"]
})
export class GeneralSettingsComponent implements OnInit {
  currentUser: User;
  savedata: any;
  generalSettings: GeneralSettingsData = new GeneralSettingsData();
  discardConfirm: EventEmitter<boolean> = new EventEmitter();
  search: string;
  countryName: any;
  codeValue: string = "+1";
  invalidCountry: boolean = false;
  invalidState: boolean = false;
  state: any[] = [];
  timeZones: any[] = [];

  constructor(
    private DataService: GeneralSettingsService,
    private alertService: AlertService,
    private discardService: DiscardDialogService,
    private loaderService: LoaderService,
    private headerService: ClientAdminHeaderService,
    private shared: SharedDataService,
    private initialize : InitializeService,
    public tzone : TimeZoneService
  ) {
    this.loaderService.showLoader(true);
    discardService.confirm$.subscribe(confirm => {
      this.discardConfirm.emit(confirm);
    });
  }

  ngOnInit() {
    this.getCountryNames();
  }

  scrolltoTop(f) {
    if (!f) window.scroll(0, 0);
  }

  getGeneralSettingsData() {
    this.DataService.getGeneralSettingsData(
      this.shared.getClientID()
    ).subscribe(data => {
      this.generalSettings = data;
      this.generalSettings.country = data.country
        ? data.country
        : "United States";
      this.codeValue = data.countryCode ? data.countryCode : "+1";

      this.getState();
      this.getTimeZones();
      this.loaderService.showLoader(false);
    });
  }

  getCountryNames() {
    this.initialize.getCountryCodes().subscribe(data => {
      this.getGeneralSettingsData();
      this.countryName = data;
      this.getState();
    });
  }

  getTimeZones() {
    this.DataService.getTimeZones().subscribe(data => {
      this.timeZones = data;
      let slID = this.generalSettings.timeZonesID;
      let sl = _.findWhere(this.timeZones, {
        timeZoneID: slID
      });
      this.generalSettings.timeZonesID = sl ? sl.timeZoneName : null;
      this.savedata = JSON.stringify(this.generalSettings);
    });
  }

  //get states
  getState() {
    var code = this.codeValue.replace("+", "");
    this.DataService.getStates(code).subscribe(data => {
      this.state = data.states;
    });
  }

  //validate country
  validateCountry(country: string) {
    let selCountry = _.findWhere(this.countryName, { countryName: country });
    this.invalidCountry = selCountry ? false : true;
  }

  //validate states
  validateState(state: string) {
    let selState = _.contains(this.state, state);
    this.invalidState = selState ? false : true;
  }

  getSelectedTimeZone(selected: string) {
    let sl = _.findWhere(this.timeZones, {
      timeZoneName: selected
    });
    return sl ? sl.timeZoneID : null;
  }

  //save general settings data
  saveGeneralSettings() {
    this.loaderService.showLoader(true);
    let model = JSON.parse(JSON.stringify(this.generalSettings));
    model.clientID = this.shared.getClientID();
    model.countryCode = this.codeValue;
    model.timeZonesID = this.getSelectedTimeZone(
      this.generalSettings.timeZonesID
    );
    this.savedata = JSON.stringify(this.generalSettings);
    this.DataService.saveGeneralSettingsData(model).subscribe(
      data => {
        this.alertService.success("Profile settings saved succesfully.");
        this.loaderService.showLoader(false);

        //update the header
        this.headerService.sendclientData(JSON.parse(this.savedata));
        this.getClientTimeZone();
      },
      error => {
        this.alertService.error(error.error.message);
        this.loaderService.showLoader(false);
      }
    );
  }

  getClientTimeZone() {
    this.tzone.getClientTimeZone(this.shared.getClientID()).subscribe(data => {
      this.tzone.storeClientTimeZone(data);
    });
  }

  // check for unsaved changes
  canDeactivate(): Observable<boolean> | boolean {
    let dataNotChanged = this.savedata === JSON.stringify(this.generalSettings);
    if (dataNotChanged) {
      return true;
    }
    this.discardService.openDiscardChangesDialog();
    return this.discardConfirm;
  }

  //get country code
  getCountryCode() {
    var a = _.findWhere(this.countryName, {
      countryName: this.generalSettings.country
    });
    this.codeValue = a.countryCode;
    this.generalSettings.state = "";
    this.getState();
  }
}
