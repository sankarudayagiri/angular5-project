import { Component, OnInit, Inject } from "@angular/core";
import { JtechUsersService, JtechAdmin } from "./jtech-users.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { UsersService, UserDetailModel } from "../../admin/users/users.service";
import { AdminHeaderService } from "../../admin/admin-header/admin-header.service";
import {
  AlertService,
  LoaderService,
  SharedDataService
} from "../../_services";
import { User } from "../../_models";
import { AuthenticationService } from "../../authentication/authentication.service";

export interface DialogData {
  name: string;
}

@Component({
  selector: "jtech-users",
  templateUrl: "./jtech-users.component.html",
  styleUrls: ["./jtech-users.component.scss"],
  providers: [UsersService, AdminHeaderService]
})
export class JtechUsersComponent implements OnInit {
  jtechAdmins: any;
  name: string;
  currentUser: User;
  users: any;
  userDetail: UserDetailModel = new UserDetailModel();
  optionsEnabled: number;
  showDeleteIndex: number;
  jtechAdmin: JtechAdmin = new JtechAdmin();

  constructor(
    private JtechAdmins: JtechUsersService,
    public dialog: MatDialog,
    private UsersService: UsersService,
    private AdminHeaderService: AdminHeaderService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private SharedDataService: SharedDataService,
    private authenticate: AuthenticationService
  ) {
    this.currentUser = this.authenticate.getUser();
    this.AdminHeaderService.showAdminHeader(true);
    this.SharedDataService.showSideBar(false);
  }

  openDialog(data): void {
    const dialogRef = this.dialog.open(JtechUserDetailComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { userData: data, type: "user" }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.listAllUsers();
    });
  }

  ngOnInit() {
    this.listAllUsers();
  }

  listAllUsers() {
    this.JtechAdmins.getJetchAdminLists().subscribe(data => {
      this.jtechAdmins = data;
    });
  }

  //to delete particular user
  deleteUser(id, index) {
    this.loaderService.showLoader(true);
    this.UsersService.deleteUser(id).subscribe(
      data => {
        this.jtechAdmins.splice(index, 1);
        this.loaderService.showLoader(false);
        this.alertService.success("Successfully deleted");
        this.showDeleteIndex = null;
      },
      error => {
        this.loaderService.showLoader(false);
        this.alertService.error("Unable to delete");
      }
    );
  }

  enableOptions(userID) {
    this.optionsEnabled = userID;
  }

  showDeleteConfirm(index) {
    this.showDeleteIndex = index;
  }
}

@Component({
  selector: "jtech-user-details",
  templateUrl: "jtech-user-details.component.html",
  styleUrls: ["jtech-user-details.component.scss"],
  providers: [UsersService]
})
export class JtechUserDetailComponent {
  userDetail: UserDetailModel = new UserDetailModel();
  currentUser: User;
  errorMessages: any[] = [];
  userEditMode: boolean = false;
  matCustomError: string;
  usernameValid: boolean = true;
  validPassword: boolean = true;
  passwordComponent: string;
  passwordStrengthColor: string = "warn";
  showPasswordStrength: boolean;

  constructor(
    private dataService: UsersService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private shared: SharedDataService,
    public dialogRef: MatDialogRef<JtechUserDetailComponent>,
    private authenticate: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.currentUser = this.authenticate.getUser();
  }

  ngOnInit() {
    this.renderuser();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  createUser() {
    this.userDetail.clientID = this.shared.getClientID();
    this.data.type == "multi"
      ? (this.userDetail.isMultiUnitAdmin = true)
      : (this.userDetail.isJTechAdmin = true);
    this.dataService.createUser(this.userDetail).subscribe(
      data => {
        this.userDetail = data;
        this.dialogRef.close(true);
        this.alertService.success("Successfully created Jtech user");
      },
      error => {
        this.usernameValid = false;
        this.errorMessages = error.error.errors;
      }
    );
  }

  renderuser() {
    this.userDetail = this.data.userData
      ? this.data.userData
      : new UserDetailModel();
    this.userEditMode = this.data.userData ? true : false;
  }
  updateUser(id: string) {
    if (this.data.type == "multi") {
      id = this.userDetail.userID;
      this.userDetail.clientID = this.data.userData
        ? this.data.userData.multiUnitClientID
        : null;
    }
    id ? this.editUser(id) : this.createUser();
  }

  editUser(id) {
    this.loaderService.showLoader(true);
    this.userDetail.id = id;
    if (this.data.type == "multi") {
      this.userDetail.isMultiUnitAdmin = true;
      this.userDetail.isClientAdmin = false;
      this.userDetail.isJTechAdmin = false;
      this.userDetail.isHost = false;
    }
    this.dataService.editUsers(this.userDetail).subscribe(
      data => {
        this.loaderService.showLoader(false);
        this.alertService.success("Jtech User details updated successfully.");
        this.dialogRef.close(true);
      },
      error => {
        this.loaderService.showLoader(false);
        this.usernameValid = false;
        this.errorMessages = error.error.errors;
        // this.alertService.error(error.error.message);
      }
    );
  }

  onStrengthChanged(strength: number) {
    setTimeout(() => {
      if (strength >= 25 && strength < 100) {
        this.passwordStrengthColor = "accent";
        this.validPassword = false;
      } else if (strength == 100) {
        this.validPassword = true;
        this.passwordStrengthColor = "primary";
      } else {
        this.validPassword = false;
        this.passwordStrengthColor = "warn";
      }
    });
  }
}
