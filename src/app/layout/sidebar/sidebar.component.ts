import { Component, OnInit } from "@angular/core";
import { NotificationService } from "../../notification/notification.service";
import { NotesService } from "../../notes/notes.service";
import {
  SharedDataService,
  ModuleStatus
} from "../../_services/shared-data.service";
import { UpdateResultsService, TimeZoneService } from "../../_services";
import { InitializeService } from "../../_services/initialize.service";
import { Subscription } from "rxjs";
import { User } from "../../_models";
import { AuthenticationService } from "../../authentication/authentication.service";

export class Badger {
  fromDate: string;
  toDate: string;
  clientID: string;
}

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"]
})
export class SidebarComponent implements OnInit {
  //currentUser: User;
  badgeModel: Badger = new Badger();
  badge: any;
  currentUser: User;
  superAdmin: boolean = false;
  clientAdmin: boolean = false;
  multiUnitAdmin: boolean = false;
  showSidebar: boolean = true;
  modules: ModuleStatus = new ModuleStatus();
  private updateBadgerSubscription: Subscription;

  constructor(
    public NotificationService: NotificationService,
    public NotesService: NotesService,
    public shared: SharedDataService,
    public initialize: InitializeService,
    public update: UpdateResultsService,
    public tzone: TimeZoneService,
    private authenticate: AuthenticationService
  ) {
    this.currentUser = this.authenticate.getUser();

    shared.showSidebar$.subscribe(header => {
      setTimeout(() => {
        this.showSidebar = header;
      });
    });

    this.updateBadgerSubscription = shared.updateBadgerCount$.subscribe(() => {
      this.badger();
    });

    initialize.updateModuleStatus$.subscribe(() => {
      this.modules = this.initialize.returnModuleStatus();
    });
  }

  ngOnInit() {
    if (this.currentUser) {
      this.superAdmin = this.currentUser.role === "JtechAdmin" ? true : false;
      this.clientAdmin = this.currentUser.role === "ClientAdmin" ? true : false;
      this.multiUnitAdmin =
        this.currentUser.role === "MultiUnitAdmin" ? true : false;
    }
    let modules = this.initialize.returnModuleStatus();
    this.modules = modules ? modules : new ModuleStatus();
    this.badger();
  }

  badger() {
    let d = this.tzone.getClientDateTimeWithLTZone(new Date()),
      fromDate = new Date(d.setHours(0, 0, 0, 0)),
      toDate = new Date(d.setHours(24, 0, 0, 0));
    this.badgeModel.fromDate = this.tzone.getClientTimeWithCTZone(fromDate);
    this.badgeModel.toDate = this.tzone.getClientTimeWithCTZone(toDate);
    this.badgeModel.clientID = this.shared.getClientID();
    this.shared.badger(this.badgeModel).subscribe(data => {
      this.badge = data.data;
    });
  }

  // clear subscription on destroy
  ngOnDestroy() {
    this.updateBadgerSubscription.unsubscribe();
  }
}
