import { Component, OnInit, Inject } from "@angular/core";
import { AlertService, SharedDataService } from "../../_services";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { SlicePipe } from "@angular/common";
import * as _ from "underscore";
import { InitializeService } from "../../_services/initialize.service";
import { StaffListService } from "../staff-list/staff-list.service";

export class StaffModel {
  id: string;
  initials: string = "";
  firstName: string = "";
  lastName: string = "";
  phoneNumber: string = "";
  pager: number;
  isServer: boolean = true;
  isManager: boolean = false;
  isKitchenStaff: boolean = false;
  isOther: boolean = false;
  clientID: string;
  colorCode: string;
  countryCode: string = "";
}

@Component({
  selector: "add-edit-staff",
  templateUrl: "add-edit-staff.component.html",
  styleUrls: ["add-edit-staff.component.scss"],
  providers: [SlicePipe]
})
export class AddEditStaffDialog implements OnInit {
  staff: StaffModel = new StaffModel();
  multiple = false;
  group: string;
  errorMessages: any[] = [];
  matCustomError: string;
  countries: any;
  codeValue: string = "1";
  invalidCountry: boolean = false;
  countryCode: string;

  constructor(
    private staffService: StaffListService,
    private slicePipe: SlicePipe,
    private shared: SharedDataService,
    private initialize : InitializeService,
    public alertService: AlertService,
    public dialogRef: MatDialogRef<AddEditStaffDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    if (this.data.type == 1) {
      this.staff = JSON.parse(JSON.stringify(this.data.server));
      this.getCountryNames();
    } else {
      this.staff = new StaffModel();
      this.staff.colorCode =
        "#" + (Math.random().toString(16) + "000000").substring(2, 8);
      this.getCountryNames();
    }
  }

  validateMinLen(val: any) {
    return val > 0 ? 2 : null;
  }

  updateInitials(val: string) {
    this.staff.initials = this.slicePipe.transform(val, 0, 2);
  }

  addStaff(id: string) {
    this.staff.clientID = this.shared.getClientID();
    this.staff.initials = this.staff.initials
      ? this.staff.initials
      : this.slicePipe.transform(this.staff.firstName, 0, 2);
    if (id || this.data.serverID) {
      this.updateStaff();
    } else {
      this.createStaff();
    }
  }

  createStaff() {
    this.staff.firstName=this.staff.firstName==""?null:this.staff.firstName
    this.staff.initials = this.staff.initials.toUpperCase();
    this.staffService.createStaff(this.staff).subscribe(
      data => {
        this.dialogRef.close(true);
      },
      error => {
        if (Array.isArray(error.error.errors)) {
          this.alertService.error(error.error.errors[0].message);
          this.errorMessages = error.error.errors[0].message;
        } else {
          this.alertService.error(error.error.message);
          this.errorMessages = error.error.errors;
        }
      }
    );
  }

  updateStaff() {
    this.staff.id = this.staff.id ? this.staff.id : this.data.serverID;
    this.staff.initials = this.staff.initials.toUpperCase();
    this.staffService.updateStaff(this.staff).subscribe(
      data => {
        this.dialogRef.close(this.staff);
      },
      error => {
        if (Array.isArray(error.error.errors)) {
          this.alertService.error(error.error.errors[0].message);
          this.errorMessages = error.error.errors[0].message;
        } else {
          this.alertService.error(error.error.message);
          this.errorMessages = error.error.errors;
        }
      }
    );
  }

  onSelectionChange(value) {
    this.staff.isManager = value == "isManager" ? true : false;
    this.staff.isServer = value == "isServer" ? true : false;
    this.staff.isKitchenStaff = value == "isKitchenStaff" ? true : false;
    this.staff.isOther = value == "isOther" ? true : false;
  }
  getCountryNames() {
    let countryCode = this.staff.countryCode ? this.staff.countryCode : "+1";
    this.initialize.getCountryCodes().subscribe(data => {
      this.countries = data;
      let selCountry = _.findWhere(this.countries, {
        countryCode: countryCode
      });
      this.countryCode = selCountry.countryName;
      this.codeValue = selCountry.countryCode;
      this.staff.countryCode = this.codeValue;
    });
  }
  //get country code
  getCountryCode() {
    var a = _.findWhere(this.countries, {
      countryName: this.countryCode
    });
    this.codeValue = a.countryCode;
    this.staff.countryCode = this.codeValue;
  }

  //validate country
  validateCountry(country: string) {
    let selCountry = _.findWhere(this.countries, { countryName: country });
    this.staff.countryCode = this.codeValue;
    this.invalidCountry = selCountry ? false : true;
  }
}
