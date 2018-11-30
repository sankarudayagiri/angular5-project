import { Component, OnInit, Inject } from "@angular/core";
import * as _ from "underscore";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

import {
  StaffListService,
  StaffModel,
  Staff,
  staffCount
} from "./staff-list.service";
import { AddEditStaffDialog } from "../add-edit-staff/add-edit-staff.component";
import { FilterPipe } from "../../_pipes";

import {
  LoaderService,
  AlertService,
  SharedDataService
} from "../../_services";

@Component({
  templateUrl: "staff-list.component.html",
  styleUrls: ["staff-list.component.scss"],
  providers: [FilterPipe]
})
export class StaffListComponent implements OnInit {
  shiftSectionTables: any[] = [];
  staffModel: StaffModel = new StaffModel();
  staffList: Staff[] = [];
  layouts: any[] = [];
  sectionLayouts: any[] = [];
  selectedTab: number = 1;
  staffCount: staffCount = new staffCount();
  searchText: string;
  showDeleteID: number;
  selectedStaffType: string = "All";

  constructor(
    private staffService: StaffListService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private shared: SharedDataService,
    public dialog: MatDialog
  ) {
    this.loaderService.showLoader(true);
  }

  ngOnInit() {
    this.getStaffList();
  }

  getStaffList() {
    this.staffModel.clientID = this.shared.getClientID();
    this.staffService.getStaffList(this.staffModel).subscribe(
      data => {
        this.staffList = data.items;
        this.setCount(data.items);
        this.loaderService.showLoader(false);
      },
      error => {
        this.loaderService.showLoader(false);
      }
    );
  }

  setCount(items: any) {
    if (
      !this.staffModel.showServers &&
      !this.staffModel.showManagers &&
      !this.staffModel.showKitchenStaff &&
      !this.staffModel.showOthers
    ) {
      this.staffCount.all = items.length;
      this.staffCount.managers = _.where(items, { isManager: true }).length;
      this.staffCount.servers = _.where(items, { isServer: true }).length;
      this.staffCount.kitchenstaff = _.where(items, {
        isKitchenStaff: true
      }).length;
      this.staffCount.others = _.where(items, { isOther: true }).length;
    }
  }

  getFilteredStaffList(selected: string) {
    this.selectedStaffType = selected;
    this.loaderService.showLoader(true);
    this.staffModel.showServers = selected == "Servers" ? true : null;
    this.staffModel.showManagers = selected === "Managers" ? true : null;
    this.staffModel.showKitchenStaff =
      selected === "Kitchen Staff" ? true : null;
    this.staffModel.showOthers = selected === "Others" ? true : null;
    this.getStaffList();
  }

  //delete staff
  showDeleteConfirm(id): void {
    let dialogRef = this.dialog.open(StaffDeleteComponent, {
      width: "360px",
      data: { type: 1 }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.staffService.deleteStaff(id).subscribe(
          data => {
            this.getStaffList();
            this.alertService.success("Staff deleted successfully.");
          },
          error => {
            this.alertService.error(error.error.message);
          }
        );
      }
    });
  }

  // add staff
  addStaff(): void {
    let dialogRef = this.dialog.open(AddEditStaffDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { type: 0, title: "EDIT STAFF" }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getFilteredStaffList("All");
        this.getStaffList();
        this.alertService.success("Staff added successfully.");
      }
    });
  }

  viewStaff(serverDetails): void {
    let dialogRef = this.dialog.open(AddEditStaffDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { type: 1, server: serverDetails }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getStaffList();
        this.alertService.success("Staff details updated successfully.");
      }
    });
  }
}

@Component({
  templateUrl: "staff-delete.component.html"
})
export class StaffDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<StaffDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  delete() {
    this.dialogRef.close(this.data.type);
  }
}
