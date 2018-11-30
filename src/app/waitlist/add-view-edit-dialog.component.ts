import { Component, OnInit, Inject } from "@angular/core";
import { AlertService } from "../_services";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { GuestDetailModel } from "../_services";

@Component({
  selector: "add-view-edit-contatiner",
  template: `<div>
  <h6 mat-dialog-title class="dialog-header text-center font-weight-bold mb-0">
      {{data.type == 1 ? 'VIEW WAITING PARTY' : data.type==2?'UPDATE PARTY IN WAIT LIST':'+ ADD PARTY TO'}}
      {{data.type==0 ? data.waitListName:''}}
      <i class="material-icons pull-right close cursor-pointer" (click)="onNoClick()">
          clear
      </i>
  </h6>
  <view-waiting-party *ngIf="data.type==1"></view-waiting-party>
  <add-edit-waitlist *ngIf="data.type == 0 || data.type == 2"></add-edit-waitlist>
</div>`
})
export class WaitlistAddViewEditDialog implements OnInit {
  guestModel : GuestDetailModel = new GuestDetailModel;

  constructor(
    private alertService: AlertService,
    public dialogRef: MatDialogRef<WaitlistAddViewEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.data.guestModel = this.guestModel;
    this.data.guestModel.adultCovers = this.data.tops;
  }
}
