import { Component, OnInit, Inject } from "@angular/core";
import { AlertService, SharedDataService } from "../_services";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { GuestDetailModel } from "../_services";
import { SettingsService } from "../settings/settings.service";
import { TableService } from "./tables.service";
import { InitializeService } from "../_services/initialize.service";
import { User } from "../_models";
import { AuthenticationService } from "../authentication/authentication.service";

@Component({
  selector: "add-view-edit-contatiner",
  template: `<div>
  <div>
  <h6 mat-dialog-title class="dialog-header text-center mb-0 font-weight-bold">
  <span class="d-flex align-items-center d-inline-flex">
  <i class='icon-frame mr-2'></i> 
  <span>{{tableName}}</span> 
  <h2 class="ml-2 mr-2 text-muted">|</h2>
  <i class='icon-frame mr-2'></i> 
  <span>{{totalCovers}}</span>
  </span> 
  <i class="material-icons pull-right close cursor-pointer" (click)="onNoClick()">
   clear
  </i>
  </h6>
  <view-seated-party *ngIf="data.type==1"></view-seated-party>
  <seat-edit-party *ngIf="data.type==0 || data.type == 2"></seat-edit-party>
</div></div>`
})
export class SeatViewEditDialog implements OnInit {
  currentUser: User;
  guestModel: GuestDetailModel = new GuestDetailModel;
  tableName: string = null;
  totalCovers: number = 0;

  constructor(
    private alertService: AlertService,
    public dialogRef: MatDialogRef<SeatViewEditDialog>,
    public settings: SettingsService,
    private DataService: TableService,
    private shared: SharedDataService,
    private initialize : InitializeService,
    private authenticate : AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.currentUser = this.authenticate.getUser();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.data.guestModel = this.guestModel;
    this.loadUserPreferences();

    if (this.data.table.mergeDetails == null) {
      this.tableName = this.data.table.name;
      this.totalCovers = this.data.table.totalCovers;
    }
    else {
      var array = this.data.table.mergeDetails.tableIDs;
      this.DataService.getTableDetails(array[0], this.shared.getClientID()).subscribe(
        data => {
          this.tableName = this.data.table.name;
          this.totalCovers = data.covers;
        }
      )
    }
  }

  loadUserPreferences() {
    this.initialize.getUserPreference(this.currentUser.userID).subscribe(data => {
      this.data.panels = data.panels;
      this.data.colourPalettes = data.colourPalettes;
    });
  }
}
