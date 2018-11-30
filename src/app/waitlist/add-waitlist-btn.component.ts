import { Component, Input } from "@angular/core";
import * as _ from "underscore";
import { MatDialog } from "@angular/material";

import { WaitlistAddViewEditDialog } from "./add-view-edit-dialog.component";
import { UpdateResultsService, SharedDataService } from "../_services";
import { WaitlistService } from "./waitlist.service";
import { User } from "../_models";

@Component({
  selector: "add-to-waitlist-btn",
  template: `
  <button *ngIf="size == null" mat-fab class="mx-2 pull-right btn-mat-waitlist" matTooltip="Add party to Wait List" (click)="addPartyToWaitlist()">
  <mat-icon>add</mat-icon>
</button>
<button *ngIf="size == 'mini'" mat-mini-fab class="mx-2 pull-right btn-mat-waitlist" matTooltip="Add party to Wait List" (click)="addPartyToWaitlist()">
  <mat-icon>add</mat-icon>
</button>`
})
export class AddToWaitListBtnComponent {
  @Input() size: string = null;
  currentUser: User;
  waitlistTypes: any[] = [];
  selectedListID: string = null;
  waitListName: string;

  constructor(
    public dialog: MatDialog,
    private update: UpdateResultsService,
    private waitlistService: WaitlistService,
    private shared: SharedDataService
  ) {}

  ngOnInit() {
    this.getWaitlistTypes();
  }

  //get waitlist types
  getWaitlistTypes() {
    this.waitlistService
      .getWaitlist(this.shared.getClientID())
      .subscribe(data => {
        this.waitlistTypes = data.data.waitlistModel;
        this.selectedListID = _.first(this.waitlistTypes).waitListID;
        this.waitListName = _.first(this.waitlistTypes).name;
      });
  }

  //addParty dialog
  addPartyToWaitlist(): void {
    let dialogRef = this.dialog.open(WaitlistAddViewEditDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        type: 0,
        waitListID: this.selectedListID,
        avgTime: "00:00",
        waitListName: this.waitListName,
        tops : 1
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.update.updateWaitlist(true);
      }
    });
  }
}
