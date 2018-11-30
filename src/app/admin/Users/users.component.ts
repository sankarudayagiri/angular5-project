import { Component, OnInit, Inject } from "@angular/core";
import { SlicePipe } from "@angular/common";
import { UsersService, UserDetailModel } from "./users.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {
  LoaderService,
  AlertService,
  SharedDataService
} from "../../_services/index";
import { AdminHeaderService } from "./../admin-header/admin-header.service";
import { User } from "../../_models";
import { AuthenticationService } from "../../authentication/authentication.service";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"]
})
export class UsersComponent implements OnInit {
  name: string;
  users: any;
  userDetail: UserDetailModel = new UserDetailModel();
  optionsEnabled: number;
  showDeleteIndex: number;
  showName: boolean = false;

  constructor(
    private UsersService: UsersService,
    public dialog: MatDialog,
    private AdminHeaderService: AdminHeaderService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private shared: SharedDataService
  ) {
    this.loaderService.showLoader(true);
    this.AdminHeaderService.showAdminHeader(true);
    this.loaderService.showLoader(true);
  }
  openDialog(user: any): void {
    let dialogRef = this.dialog.open(UserDetailComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { user: user, type: 1, title: "EDIT USER" }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.listAllUsers();
    });
  }

  ngOnInit() {
    this.listAllUsers();
  }

  //to list all users
  listAllUsers() {
    this.UsersService.getAllUsers(this.shared.getClientID()).subscribe(
      data => {
        this.users = data;
        this.loaderService.showLoader(false);
      },
      error => {
        this.loaderService.showLoader(false);
      }
    );
  }

  //to delete particular user

  deleteUser(id, index) {
    this.loaderService.showLoader(true);
    this.UsersService.deleteUser(id).subscribe(
      data => {
        this.users.splice(index, 1);
        this.loaderService.showLoader(false);
        this.alertService.success("User deleted successfully.");
        this.showDeleteIndex = null;
      },
      error => {
        this.loaderService.showLoader(false);
        this.alertService.error(error.error.message);
      }
    );
  }

  showDeleteConfirm(index) {
    this.showDeleteIndex = index;
  }
}

@Component({
  selector: "app-user-details",
  templateUrl: "user.details.component.html",
  styleUrls: ["user.details.component.scss"],
  providers: [SlicePipe]
})
export class UserDetailComponent implements OnInit {
  currentUser: User;
  userDetail: UserDetailModel = new UserDetailModel();
  userEditMode: boolean = false;
  userRole: string = "isHost";
  errorMessages: any[] = [];
  matCustomError: string;
  usernameValid: boolean = false;
  validPassword: boolean = true;
  passwordComponent: string;
  passwordStrengthColor: string = "warn";
  showPasswordStrength : boolean;

  constructor(
    private dataService: UsersService,
    private AdminHeaderService: AdminHeaderService,
    private loaderService: LoaderService,
    private authenticate : AuthenticationService,
    private alertService: AlertService,
    public dialogRef: MatDialogRef<UserDetailComponent>,
    private shared: SharedDataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.loaderService.showLoader(true);
    this.AdminHeaderService.showAdminHeader(true);
    this.currentUser = this.authenticate.getUser();
  }

  ngOnInit() {
    this.renderuser();
  }

  renderuser() {
    this.userDetail = this.data.user ? this.data.user : new UserDetailModel();
    if (this.data.user == null) {
      this.userDetail.isHost = this.userDetail.isClientAdmin ? false : true;
    }
    this.userRole = this.userDetail.isClientAdmin ? "isClientAdmin" : "isHost";
    this.userEditMode = this.data.user ? true : false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  updateUser(id: string) {
    id ? this.editUser() : this.createUser();
  }

  onSelectionChange(value) {
    this.userDetail.isHost = value == "isHost" ? true : false;
    this.userDetail.isClientAdmin = value == "isClientAdmin" ? true : false;
  }

  createUser() {
    this.userDetail.clientID = this.shared.getClientID();
    this.dataService.createUser(this.userDetail).subscribe(
      data => {
        this.loaderService.showLoader(false);
        this.alertService.success("User created successfully.");
        this.dialogRef.close();
      },
      error => {
        this.loaderService.showLoader(false);
        this.usernameValid = false;
        this.errorMessages = error.error.errors;
      }
    );
  }

  editUser() {
    this.loaderService.showLoader(true);
    this.userDetail.clientID = this.shared.getClientID();
    this.dataService.editUsers(this.userDetail).subscribe(
      data => {
        this.loaderService.showLoader(false);
        this.alertService.success("User details updated successfully.");
        this.dialogRef.close();
      },
      error => {
        this.loaderService.showLoader(false);
        this.usernameValid = false;
        this.errorMessages = error.error.errors;
        this.alertService.error(error.error.message);
      }
    );
  }

  onStrengthChanged(strength: number) {
    setTimeout(() => {
      if (strength >= 25 && strength < 100) {
        this.validPassword = false;
        this.passwordStrengthColor = "accent";
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
