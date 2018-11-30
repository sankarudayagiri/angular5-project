import 'rxjs/add/observable/of';
import { Injectable } from '@angular/core';
import { MatDialog} from "@angular/material";
import { DiscardChangesDialog } from "../shared/discard-dialog.component";
import { Subject } from "rxjs/Subject";

@Injectable()
export class DiscardDialogService {
  private confirmDiscard = new Subject<boolean>();
  
  constructor(public dialog: MatDialog) {}

  // Observable
  confirm$ = this.confirmDiscard.asObservable();
  confirm(confirm: boolean) {
    console.log(confirm);
    this.confirmDiscard.next(confirm);
  }

  testConfirm(confirm :boolean){
    this.confirm(confirm);
  }

  openDiscardChangesDialog() {
    let dialogRef = this.dialog.open(DiscardChangesDialog, {
      width: "400px",
      height: "200px",
      hasBackdrop: true,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.confirm(result);
    });
  }
}
