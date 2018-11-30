import { Component, Input } from "@angular/core";
import { Occupancy } from "../dashboard.service";
import { SharedDataService, UpdateResultsService } from "../../_services";
import { Subscription } from "rxjs";
import { TableService } from "../../tables/tables.service";

@Component({
  selector: "widget-occupancy",
  templateUrl: "widget-occupancy.component.html",
  styleUrls: ["widget-occupancy.component.scss"]
})
export class WidgetOccupancyComponent{
  @Input()
  selectedFloorPlanId: string;
  currentOccupancy: Occupancy = new Occupancy();
  public occLoading: boolean;
  private updateFloorPlanSubscription: Subscription;

  constructor(
    private tableService: TableService,
    private shared: SharedDataService,
    public update: UpdateResultsService
  ) {
    this.updateFloorPlanSubscription = update.updateFloorPlan$.subscribe(() => {
      this.getOccupancyData();
    });
  }

  ngOnChanges(changes) {
    if (changes.selectedFloorPlanId) {
      this.getOccupancyData();
    }
  }

  getOccupancyData() {
    this.occLoading = true;
    if (this.selectedFloorPlanId) {
      this.tableService
        .currentOccupancies(this.selectedFloorPlanId, this.shared.getClientID())
        .subscribe(data => {
          this.currentOccupancy = data;
          this.occLoading = false;
        });
    } else {
      this.occLoading = false;
    }
  }

  // clear subscription on destroy
  ngOnDestroy() {
    this.updateFloorPlanSubscription.unsubscribe();
  }
}
