import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import * as _ from "underscore";

import {
  SharedDataService,
  AlertService,
  LoaderService
} from "../../../_services";
import { ShiftService, AdditionalStaffModel } from "../shift.service";

@Component({
  selector: "additional-staff",
  templateUrl: "additional-staff.component.html",
  styleUrls: ["additional-staff.component.scss"]
})
export class AdditionalStaffComponent {
  otherStaff: any[] = [];
  selectedStaff: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<AdditionalStaffComponent>,
    private shiftService: ShiftService,
    private shared: SharedDataService,
    public alert: AlertService,
    public loader: LoaderService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.getAdditionalStaffList();
  }

  getAdditionalStaffList() {
    this.shiftService
      .getAllOtherStaffList(this.shared.getClientID())
      .subscribe(data => {
        this.otherStaff = data;
      });
  }

  selectOtherStaff(staff: any) {
    let self = this;
    staff.className = staff.className == "selected" ? "" : "selected";
    let st = _.indexOf(self.selectedStaff, staff.id);
    if (st != -1) {
      this.selectedStaff.splice(st, 1);
    } else {
      this.selectedStaff.push(staff.id);
    }
  }

  assignAdditionalStaff() {
    let model = new AdditionalStaffModel();
    model.shiftID = this.data.shiftID;
    model.clientID = this.shared.getClientID();
    model.staffIDs = this.selectedStaff;
    this.shiftService.assignOtherStaffToShift(model).subscribe(
      data => {
        this.alert.success("Successfully assigned Additional staff");
        this.dialogRef.close(true);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }
}
