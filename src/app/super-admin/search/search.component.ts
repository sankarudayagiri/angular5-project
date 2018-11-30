import { Component, OnInit } from "@angular/core";
import { JtechAdminService } from "./search.service";
import { Router } from "@angular/router";
import { SharedDataService, SessionService } from "../../_services";
import * as _ from "underscore";
import { User } from "../../_models";
import { ClientSearch, AccountCount } from "./search.models";
import { AuthenticationService } from "../../authentication/authentication.service";

@Component({
  selector: "client-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
  providers: [JtechAdminService]
})
export class SearchComponent implements OnInit {
  public clientInfo: ClientSearch = new ClientSearch();
  public searchData: Location[] = [];
  public currentUser: User;
  public username: any;
  public count: AccountCount = new AccountCount();
  public clientsList: any;
  public searchLoader: boolean = false;
  public noResults: boolean = false;

  constructor(
    private jAdminService: JtechAdminService,
    private router: Router,
    private sessionStorage: SessionService,
    private shared: SharedDataService,
    private authenticate  :AuthenticationService
  ) {
    this.currentUser = this.authenticate.getUser();
    this.shared.clearSessions();
  }

  ngOnInit() {
    this.getClientCount();
  }

  searchLocations = _.debounce(function(event) {
    this.updateSearch(event);
  }, 500);

  updateSearch(event: any) {
    if (event.target.value && event.target.value.length) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        event.preventDefault();
      } else {
        if (event.target.value.length) {
          this.searchLoader = true;
          this.jAdminService
            .postClientSearch(this.clientInfo)
            .subscribe(data => {
              this.searchData = data.data;
              this.searchLoader = false;
              this.noResults = this.searchData.length == 0 ? true : false;
            });
        }
      }
    } else {
      this.searchData = [];
      this.searchLoader = false;
    }
  }

  viewAccount(id) {
    this.shared.clearSessions();
    this.sessionStorage.storeSessionClientID(id);
    this.router.navigate(["/admin/settings"]);
  }

  getClientCount() {
    this.jAdminService.clientCount(12).subscribe(data => {
      this.clientsList = data.data.result;
      this.count = data.count;
    });
  }
}
