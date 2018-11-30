import { Component, OnInit, Input } from "@angular/core";
import { User } from "../_models/index";
import {
  AlertService,
  SessionService,
  SharedDataService,
  TimeZoneService
} from "../_services/index";
import { JtechAdminService } from "../super-admin/search/search.service";
import { Router } from "@angular/router";
import { ClientAdminHeaderService } from "../shared/client-admin-header.service";
import { InitializeService } from "../_services/initialize.service";
import {
  AccountCount,
  ClientSearch
} from "../super-admin/search/search.models";
import { AuthenticationService } from "../authentication/authentication.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  providers: [JtechAdminService]
})
export class AppHeaderComponent implements OnInit {
  message: any;
  username: string;
  currentUser: User;
  users: User[] = [];
  user: any;
  showJtechHeader: boolean;
  clientInfo: ClientSearch = new ClientSearch();
  searchData: any = [];
  currentUserID: any;
  selected = "All";
  count: AccountCount = new AccountCount();
  @Input()
  public location: boolean = false;
  private initializeSubscription: Subscription;

  constructor(
    private alertService: AlertService,
    private searchService: JtechAdminService,
    private router: Router,
    private sessionStorage: SessionService,
    private headerService: ClientAdminHeaderService,
    public shared: SharedDataService,
    private initialize: InitializeService,
    private authenticate: AuthenticationService,
    public tzone: TimeZoneService
  ) {
    this.currentUser = this.authenticate.getUser();
    this.alertService.getMessage().subscribe(message => {
      this.message = message;
    });
    this.showJtechHeader = this.currentUser.role == "JtechAdmin" ? true : false;
    this.headerService.getclientData().subscribe(data => {
      this.clientInfo.searchText = data.dba;
    });

    this.initializeSubscription = initialize.notifyInitialize$.subscribe(() => {
      this.currentUser.role == "JtechAdmin" && this.loadLocation();
    });
  }

  ngOnInit() {
    if (this.currentUser.role == "JtechAdmin") {
      this.getClientCount();
      if (sessionStorage.clientID) {
        this.getClientDetails();
      }
    }
    if (this.currentUser.role == "ClientAdmin") {
      this.getClientDetails();
    }
  }

  getClientDetails() {
    let clientDetails = this.initialize.returnClientDetails();
    if (clientDetails) {
      this.clientInfo.searchText = clientDetails.dba;
      this.headerService.sendclientData(clientDetails);
    }
  }

  onKey(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
    } else {
      if (event.target.value.length > 1) {
        this.searchService.postClientSearch(this.clientInfo).subscribe(data => {
          this.searchData = data;
        });
      }
    }
  }

  viewAccount(id) {
    this.shared.clearSessions();
    this.sessionStorage.storeSessionClientID(id);
    this.initialize.initializeLocation(
      this.shared.getClientID(),
      this.currentUser.userID,
      this.currentUser.role
    );
  }

  loadLocation() {
    this.router.navigate(["/admin/settings"]);
    this.getClientDetails();
    this.shared.updateBadger(true);
  }

  getClientCount() {
    this.searchService.clientCount(12).subscribe(data => {
      this.count = data.count;
    });
  }

  ngOnDestroy() {
    this.initializeSubscription.unsubscribe();
  }
}
