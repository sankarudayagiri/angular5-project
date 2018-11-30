import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material";
import { AlertService, SharedDataService } from "../../_services";
import { WaitlistAddViewEditDialog } from "../add-view-edit-dialog.component";
import { WaitlistService } from "../waitlist.service";

export class Waitlist {
  id: string = null;
  name: string;
  clientID: string;
}

@Component({
  styleUrls: ["add-list.component.scss"],
  templateUrl: "add-list.component.html",
  providers: [WaitlistService]
})

export class AddToListComponent implements OnInit {
  waitlist: Waitlist = new Waitlist();
  errorMessage: string;
  constructor(
    private DataService: WaitlistService,
    private alertService: AlertService,
    private shared: SharedDataService,
    public dialogRef: MatDialogRef<WaitlistAddViewEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    
    if (this.data.waitList) {
      this.waitlist.id = this.data.waitList.waitListID;
      this.waitlist.name = this.data.waitList.name;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addToWaitList() {
    this.waitlist.clientID = this.shared.getClientID();
    this.DataService.addToList(this.waitlist).subscribe(
      data => {
        this.dialogRef.close(data.data);
      },
      error => {
        this.errorMessage = error.error.message;
      }
    );
  }
}
