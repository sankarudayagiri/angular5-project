import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Cacheable } from "ngx-cacheable";
import { Subject } from "rxjs";
import { SharedDataService } from "./shared-data.service";
import { TimeZoneService } from "./timezone.service";
import { Router } from "@angular/router";
import { Client } from "../_models/client";

@Injectable()
export class InitializeService {
  public role: string;
  public countryList: any;
  public userPreferences: any;
  public moduleStatus: any;
  public clientCountryCode: string;
  public clientTimeZone: string;
  public clientDetails: Client;
  public initializeCount: number = 0;
  private floorPlanList: Array<any> = [];

  private notifyAppInitializeStart = new Subject<boolean>();
  private notifyAppInitialize = new Subject<boolean>();
  private updateModuleStatusResults = new Subject<boolean>();
  private notifyJtechPageLoad = new Subject<boolean>();
  private notifyFloorPlanListResults = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private router: Router,
    public shared: SharedDataService,
    public tzone: TimeZoneService
  ) {}

  notifyInitializeStart$ = this.notifyAppInitializeStart.asObservable();
  notifyInitialize$ = this.notifyAppInitialize.asObservable();
  notifyJtechPages$ = this.notifyJtechPageLoad.asObservable();
  updateModuleStatus$ = this.updateModuleStatusResults.asObservable();
  notifyFloorPlanUpdate$ = this.notifyFloorPlanListResults.asObservable();

  // get floor plan list
  getFloorPlansList(clientId: string) {
    this.getFloorPlans(clientId).subscribe(data => {
      this.floorPlanList = data;
      this.notifyFloorPlanListResults.next(true);
      this.checkToNotify();
    });
  }

  // get user references
  getUserPreferenceSettings(userId: string) {
    this.getUserPreference(userId).subscribe(data => {
      this.userPreferences = data;
      this.checkToNotify();
    });
  }

  // get module status
  getModuleStatus(clientId: string) {
    this.getModuleAccessDetails(clientId).subscribe(data => {
      this.moduleStatus = data;
      this.shared.storeModuleStatus(data);
      this.checkToNotify();
      this.updateModuleStatusResults.next(true);
    });
  }

  // get clilent time zone
  getClientLocationTimeZone(clientId: string) {
    this.getClientTimeZone(clientId).subscribe(data => {
      //this.clientTimeZone = data;
      this.tzone.storeClientTimeZone(data);
      this.checkToNotify();
    });
  }

  //get client details
  getClientInfo(clientId: string) {
    this.getClientDetails(clientId).subscribe(data => {
      this.clientDetails = data.data;
      this.checkToNotify();
    });
  }

  //initialize the app client data
  initializeLocation(clientId: string, userId: string, role: string) {
    if (clientId) {
      this.role = role;
      this.notifyAppInitializeStart.next(true);
      this.initializeCount = 0;
      this.getUserPreferenceSettings(userId);
      this.getModuleStatus(clientId);
      this.getClientLocationTimeZone(clientId);
      role != "Host" && this.getClientInfo(clientId);
      this.getFloorPlansList(clientId);
      this.getCountryCodes().subscribe(data => {
        this.countryList = data;
      });
      this.getSelectedCountryCodes(clientId).subscribe(data => {
        this.clientCountryCode = data;
        this.checkToNotify();
      });
    } else {
      this.router.navigate(["/jtech-admin/search"]);
    }
  }

  //notify the app after initialize client data
  checkToNotify() {
    this.initializeCount = this.initializeCount + 1;
    // CLEANUP : update the condition
    if (this.initializeCount == 6 && this.role != "Host") {
      this.notifyAppInitialize.next(true);
      this.updateModuleStatusResults.next(true);
    } else if (this.initializeCount == 5 && this.role == "Host") {
      this.notifyAppInitialize.next(true);
      this.updateModuleStatusResults.next(true);
    }
  }

  // load jtech pages
  loadJtechPages() {
    this.notifyJtechPageLoad.next(true);
  }

  /* ===== api services  ============ */
  getCountryCodes() {
    return this.http.get<any>(environment.API + "/Guest/countryCodes");
  }

  getSelectedCountryCodes(clientId: string) {
    return this.http.get<any>(
      environment.API + "/client/GetCountryCode/" + clientId
    );
  }

  getUserPreference(userId: string) {
    return this.http.get<any>(
      environment.API + "/Settings/Preferences/" + userId
    );
  }

  getModuleAccessDetails(clientId: string) {
    return this.http.get<any>(
      environment.API + "/client/getModuleAccessDetails/" + clientId
    );
  }

  getClientTimeZone(clientId: string) {
    return this.http.get<any>(
      environment.API + "/client/getClientTimeZoneOffset/" + clientId
    );
  }

  getClientDetails(clientid: string) {
    return this.http.get<any>(
      environment.API + "/client/admin/get/" + clientid
    );
  }

  getFloorPlans(clientId: string) {
    return this.http.get<any>(
      environment.API + "/Floor/layout/list/" + clientId
    );
  }

  returnCountryList() {
    return this.countryList;
  }

  returnUserPreferences() {
    return this.userPreferences;
  }

  returnModuleStatus() {
    return this.moduleStatus;
  }

  returnClientDetails() {
    return this.clientDetails;
  }

  returnClientTimeZone() {
    return this.clientTimeZone;
  }

  returnFloorPlanList() {
    return this.floorPlanList;
  }
}
