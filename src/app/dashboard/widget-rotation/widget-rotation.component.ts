import { Component, Input } from "@angular/core";
import {
  SharedDataService,
  PlanRenderService,
  UpdateResultsService
} from "../../_services";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";
import * as _ from "underscore";
import { SeatViewEditDialog } from "../../tables/seat-view-edit-dialog.component";
import { MatDialog } from "@angular/material";
import { floorPlan, TableService } from "../../tables/tables.service";
import { Subscription } from "rxjs";

@Component({
  selector: "widget-rotation",
  templateUrl: "widget-rotation.component.html",
  styleUrls: ["widget-rotation.component.scss"]
})
export class WidgetRotationComponent {
  @Input()
  selectedFloorPlanId: string;
  @Input()
  floorPlans: any[] = [];
  @Input()
  selectedFloorPlan: floorPlan = new floorPlan();
  public rotations: any[] = [];
  public rotationLoading: boolean;
  public seatedTimerIntervalInstance: any;
  private updateFloorPlanSubscription: Subscription;

  public rotationConfig: SwiperConfigInterface = {
    slidesPerView: 3,
    containerModifierClass: "rotation-swiper"
  };

  constructor(
    private tableService: TableService,
    private shared: SharedDataService,
    public planRenderService: PlanRenderService,
    private dialog: MatDialog,
    public update: UpdateResultsService
  ) {
    this.updateFloorPlanSubscription = update.updateFloorPlan$.subscribe(() => {
      this.getTableRotation();
    });
  }

  ngOnChanges(changes) {
    if (changes.selectedFloorPlanId) {
      this.getTableRotation();
    }
  }

  getTableRotation() {
    this.rotationLoading = true;
    if (this.selectedFloorPlanId) {
      this.tableService
        .tableRotation(this.selectedFloorPlanId, this.shared.getClientID())
        .subscribe(data => {
          let self = this;
          _.each(data, function(rotation) {
            rotation.serverTableDetails = _.reject(
              rotation.serverTableDetails,
              function(table) {
                return table.mergeDetails && !table.mergeDetails.isPrimaryTable;
              }
            );
            _.each(rotation.serverTableDetails, function(t) {
              t =
                t.tableStatus.id != 1 &&
                self.planRenderService.updateTimeProgress(
                  t,
                  t.guestOccuipedTime
                );
            });
          });

          this.rotations = data;

          let newList = this;
          newList = _.each(this.rotations, function(rotation) {
            var a = _.sortBy(rotation.serverTableDetails, "spentTime");
            var a = a.reverse();
            rotation.serverTableDetails = a;
            return rotation.a;
          });

          this.runSeatedTimer(this.rotations);
          this.rotationLoading = false;
        });
    } else {
      this.rotationLoading = false;
    }
  }

  runSeatedTimer(rotations) {
    let self = this;
    clearInterval(this.seatedTimerIntervalInstance);
    this.seatedTimerIntervalInstance = setInterval(() => {
      _.each(rotations, function(r) {
        _.each(r.serverTableDetails, function(t) {
          t =
            t.tableStatus.id != 1 &&
            self.planRenderService.updateTimeProgress(t, t.guestOccuipedTime);
        });
      });
    }, 20000);
  }

  //select table
  selectTable(table: any, rotation: any) {
    table.server = {
      id: rotation.serverID,
      description: rotation.firstName + " " + rotation.lastName
    };
    table.serverColor = rotation.colorCode;
    table.serverInitials = rotation.initials;
    table.name = table.tableName;

    table.tableStatus.description == "Occupied"
      ? this.viewSeatedParty(table, null)
      : this.viewSeatedParty(table, "available");
  }

  viewSeatedParty(table: any, seatAvailable: string): void {
    table.seatedTime = table.guestOccuipedTime;
    let dialogRef = this.dialog.open(SeatViewEditDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        type: 1,
        table: table,
        seat: seatAvailable,
        shiftLayoutID: this.shared.getShiftLayoutID()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // UPDATE WIDGETS
      }
    });
  }

  // clear subscription on destroy
  ngOnDestroy() {
    this.updateFloorPlanSubscription.unsubscribe();
  }
}
