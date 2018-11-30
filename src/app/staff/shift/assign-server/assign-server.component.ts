import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

import {
  SharedDataService,
  AlertService,
  LoaderService
} from "../../../_services";
import { ShiftService, UnassignServer } from "../shift.service";
import { User } from "../../../_models";
import { AuthenticationService } from "../../../authentication/authentication.service";

export class StaffModel {
  sectionID: string;
  serverID: string;
  isShiftNow: boolean;
  clientID: string;
  shiftID: string;
  initials: string;
}

export class SectionStaffListModel {
  layoutID: string;
  clientID: string;
  shiftLayoutID: string;
}

@Component({
  selector: "assign-server",
  templateUrl: "assign-server.component.html",
  styleUrls: ["assign-server.component.scss"]
})
export class AssignServerComponent {
  sectionStaffListModel: SectionStaffListModel = new SectionStaffListModel();
  staffModel: StaffModel = new StaffModel();
  currentUser: User;
  sectionStaff: any;
  selectedServerID: string;
  showUnassign: boolean = false;
  initials: string;
  staff: StaffModel = new StaffModel();

  constructor(
    public dialogRef: MatDialogRef<AssignServerComponent>,
    private shiftService: ShiftService,
    private shared: SharedDataService,
    public alert: AlertService,
    public loader: LoaderService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authenticate : AuthenticationService
  ) {
    this.currentUser = this.authenticate.getUser();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.getSectionStaffList();
  }

  getSectionStaffList() {
    this.sectionStaffListModel.clientID = this.shared.getClientID();
    this.sectionStaffListModel.layoutID = this.data.layoutID;
    this.sectionStaffListModel.shiftLayoutID = this.data.shiftLayoutID;
    this.shiftService
      .getSectionStaffList(this.sectionStaffListModel)
      .subscribe(data => {
        this.sectionStaff = data;
      });
  }

  assignStaff(staff: any) {
    this.staffModel.clientID = this.shared.getClientID();
    this.staffModel.isShiftNow = this.data.shiftNow;
    this.staffModel.sectionID = this.data.sectionID;
    this.staffModel.serverID = staff.id;
    this.staffModel.shiftID = this.data.shiftID;
    this.shiftService.assignSectionStaff(this.staffModel).subscribe(
      data => {
        this.alert.success("Server assigned successfully");
        this.dialogRef.close(true);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  unassignServer() {
    let model = new UnassignServer();
    model.clientID = this.shared.getClientID();
    model.sectionID = this.data.sectionID;
    model.serverID = this.data.serverID;
    model.isShiftNow = this.data.shiftNow;
    this.shiftService.unassignServer(model).subscribe(
      data => {
        this.alert.success("Server unassigned successfully");
        this.dialogRef.close(true);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }
}
