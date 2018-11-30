import { Component, OnInit } from "@angular/core";
import {
  MultiUnitUserService,
  clientData,
  multiClientData
} from "./multi-unit-users.service";
import { MatDialog } from "@angular/material";
import { UsersService } from "../../admin/users/users.service";
import {
  AlertService,
  LoaderService,
  SharedDataService
} from "../../_services";
import { JtechAdminService } from "../search/search.service";
import { ENTER, COMMA } from "@angular/cdk/keycodes";
import * as _ from "underscore";
import { ClientSearch } from "../search/search.models";
import { JtechUserDetailComponent } from "../jtech-users/jtech-users.component";

export class client {
  clientData: any;
}

@Component({
  templateUrl: "./multi-unit-users.component.html",
  styleUrls: ["./multi-unit-users.component.scss"],
  providers: [UsersService, JtechAdminService]
})
export class MultiUnitUsersComponent implements OnInit {
  multiAdminUsers: multiClientData[] = [];
  showDeleteIndex: number;
  searchData: any = [];
  clientInfo: ClientSearch = new ClientSearch();
  clients: any = [];
  clientData: any = [];
  multiUserData: any;
  addClientsInfo: clientData = new clientData();
  separatorKeysCodes = [ENTER, COMMA];
  addChipData: any = [];

  constructor(
    private MultiUnitUserService: MultiUnitUserService,
    public dialog: MatDialog,
    private UsersService: UsersService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private SharedDataService: SharedDataService,
    private DataService: JtechAdminService
  ) {
    this.SharedDataService.showSideBar(false);
  }

  ngOnInit() {
    this.getMultiClientsList();
    this.addChipData.push(false);
  }

  getMultiClientsList() {
    this.MultiUnitUserService.getMultiUnitUsersLists().subscribe(
      data => {
        this.multiAdminUsers = data.data;
      },
      error => {}
    );
  }

  addClients(id) {
    var clients;
    var clientsArray = [];
    this.addClientsInfo.multiUnitClientID = id;

    _.each(this.multiAdminUsers, function(i) {
      if (i.multiUnitClientID == id) {
        clients = i.clients;
      }
    })
    _.each(clients, function (i) {
      clientsArray.push(i.id)
    })
    this.addClientsInfo.clientIDs = clientsArray;
    this.MultiUnitUserService.addClients(this.addClientsInfo).subscribe(
      data => { 
        this.alertService.success("Successfully saved.");
      }
    );
  }

  addNewMultiUser(data): void {
    let dialogRef = this.dialog.open(JtechUserDetailComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { type: "multi", userData: data }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.getMultiClientsList();
    });
  }

  //to delete particular user
  deleteUser(id, index) {
    this.UsersService.deleteUser(id).subscribe(
      data => {
        this.loaderService.showLoader(false);
        this.getMultiClientsList();
        this.alertService.success("Successfully deleted");
        this.showDeleteIndex = null;
      },
      error => {
        this.loaderService.showLoader(false);
        this.alertService.error("Unable to delete");
      }
    );
  }

  removeChip(index, chipIndex) {
    this.multiAdminUsers[index].clients.splice(chipIndex, 1);
  }

  showDeleteConfirm(index) {
    this.showDeleteIndex = index;
  }

  onKey(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
    } else {
      if (event.target.value.length) {
        this.clientInfo.searchText = event.target.value;
        this.DataService.postClientSearch(this.clientInfo).subscribe(data => {
          this.searchData = data;
        });
      }
    }
  }

  viewAccount(dba, id, index) {
    this.addChip[index] = true;
    this.clients.push(dba);
    this.MultiUnitUserService.getClients(id).subscribe(data => {});
  }

  addChip(clientId, dba, id, index) {
    var duplicate;
    this.addChipData[index] = false;
    let value = clientId;
    _.each(this.multiAdminUsers, function(i) {
      if (i.multiUnitClientID == value) {
        for (let j = 0; j < i.clients.length; j++) {
          if (_.isMatch(i.clients[j], { id: id })) {
            duplicate = true;
            break;
          }
        }
        duplicate ? "" : i.clients.push({ dba: dba, id: id });
      }
    });
  }
}
