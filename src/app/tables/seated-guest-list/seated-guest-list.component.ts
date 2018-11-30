import { Component, OnInit, Input } from "@angular/core";
import { MatDialog } from "@angular/material";
import { SharedDataService, AlertService, PlanRenderService } from "../../_services";
import { UpdateResultsService } from "../../_services/update-results.service";
import { TableService } from "../tables.service";
import { SeatViewEditDialog } from "../seat-view-edit-dialog.component";
import { Table } from "../../admin/floor-plan/floor-plan.service";
import * as _ from "underscore";
import { Subscription } from "rxjs";

@Component({
  selector: "seated-guest-list",
  templateUrl: "./seated-guest-list.component.html",
  styleUrls: ["./seated-guest-list.component.scss"]
})
export class SeatedGuestListComponent implements OnInit {
  seatedGuests: any[] = [];
  @Input()
  tables: Table[] = [];
  @Input()
  selectedFloorPlanId: string;
  seatedTimerIntervalInstance: any;
  private updateSeatedGuestSubscription: Subscription;

  constructor(
    public dialog: MatDialog,
    private shared: SharedDataService,
    public update: UpdateResultsService,
    public alert: AlertService,
    public tableService: TableService,
    private planRenderService: PlanRenderService,
  ) {
    this.updateSeatedGuestSubscription = update.updateSeatedGuests$.subscribe(
      update => {
        this.getSeatedGuest();
      }
    );
  }

  ngOnInit() {
   
  }

  ngOnChanges(changes) {
    if (
      changes &&
      changes.selectedFloorPlanId &&
      changes.selectedFloorPlanId.currentValue
    ) {
      this.getSeatedGuest();
    }
  }

  getSeatedGuest() {
    this.tableService
      .getSeatedGuest(this.selectedFloorPlanId, this.shared.getClientID())
      .subscribe(
        data => {
          let self = this;
          this.seatedGuests = data;
            _.each(this.seatedGuests, function(t) {
              t =
              t.seatedTime &&
              self.planRenderService.updateTimeProgress(t, t.seatedTime);
          });
          this.seatedGuests = _.sortBy(this.seatedGuests, function (
            seatedGuests
          ) {
            return seatedGuests.seatedTime;
          });
          this.seatedTimerIntervalInstance = setInterval(() => {
            _.each(this.seatedGuests , function(t) {
              t =
                t.seatedTime &&
                self.planRenderService.updateTimeProgress(t, t.seatedTime);
            });
          }, 20000);
        
        
        },
        error => {}
      );
  }

  viewSeatedParty(guest: any): void {
    let guestTable = this.getSeatedGuestTable(guest.tableID);
    let dialogRef = this.dialog.open(SeatViewEditDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        type: 1,
        table: guestTable,
        seat: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {});
  }

  getSeatedGuestTable(tableID) {
    let table = _.findWhere(this.tables, {
      tableID: tableID
    });
    return table;
  }

  // updateTimeProgress(t) {
  //   let seatedTime = new Date(t.seatedTime),
  //     currentTime = new Date(),
  //     diff = (currentTime.getTime() - seatedTime.getTime()) / 60000,
  //     hours =
  //       Math.floor(diff / 60) > 9
  //         ? Math.floor(diff / 60)
  //         : "0" + Math.floor(diff / 60),
  //     minutes =
  //       Math.floor(diff % 60) > 9
  //         ? Math.floor(diff % 60)
  //         : "0" + Math.floor(diff % 60);
  //   t.spentTime = hours + ":" + minutes;
  //   t.percent = (diff / 45) * 100;

  //   return t;
  // }

 
  // clear subscription on destroy
  ngOnDestroy() {
    this.updateSeatedGuestSubscription.unsubscribe();
  }
}
