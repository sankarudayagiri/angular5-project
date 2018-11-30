import { Component, OnInit } from "@angular/core";
import { User } from "../../_models/index";
import { AdminHeaderService } from "./admin-header.service";
import { Occupancy } from "../../dashboard/dashboard.service";
import { JtechAdminService } from "../../super-admin/search/search.service";
import { SlicePipe } from "@angular/common";
import { ClientAdminHeaderService } from "../../shared/client-admin-header.service";
import {
  SharedDataService,
  TimeZoneService,
  ModuleStatus,
  UpdateResultsService
} from "../../_services";
import { InitializeService } from "../../_services/initialize.service";
import { Client } from "../../_models/client";

@Component({
  selector: "app-admin-header",
  templateUrl: "./admin-header.component.html",
  styleUrls: ["./admin-header.component.scss"],
  providers: [JtechAdminService, SlicePipe]
})
export class AdminHeaderComponent implements OnInit {
  currentUser: User;
  users: User[] = [];
  currentOccupancy: Occupancy = new Occupancy();
  showAdminHeader: boolean = true;
  clientName: Client = new Client();
  displayDate: Date = new Date();
  timezone: string;
  modules: ModuleStatus;

  constructor(
    private headerService: ClientAdminHeaderService,
    private slicePipe: SlicePipe,
    private DataService: JtechAdminService,
    private shared: SharedDataService,
    private update: UpdateResultsService,
    private initialize: InitializeService,
    public tzone: TimeZoneService,
    private AdminService: AdminHeaderService
  ) {
    //update header
    this.timezone = this.tzone.getSavedClientTimeZone();

    this.headerService.getclientData().subscribe(data => {
      this.clientName = data;
      this.updateInitials(data.dba);
    });

    AdminService.showAdminHeader$.subscribe(header => {
      this.showAdminHeader = header;
    });

    initialize.notifyInitialize$.subscribe(() => {
      this.getClientDetails();
    });
  }

  ngOnInit() {
    this.getClientDetails();
  }

  getClientDetails() {
    this.clientName = this.initialize.returnClientDetails();
    this.updateInitials(this.clientName.dba);
  }

  updateInitials(val: string) {
    this.clientName.initials = this.slicePipe.transform(val, 0, 2);
  }
}
