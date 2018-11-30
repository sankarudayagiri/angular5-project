import { Component, Input } from "@angular/core";
import { SharedDataService, UpdateResultsService } from "../../_services";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";
import { Subscription } from "rxjs";
import { TableService } from "../../tables/tables.service";
import { User } from "../../_models";
import { AuthenticationService } from "../../authentication/authentication.service";

@Component({
  selector: "widget-avl-tables",
  templateUrl: "widget-avl-tables.component.html",
  styleUrls: ["widget-avl-tables.component.scss"]
})
export class WidgetAvlTablesComponent{
  public currentUser: User;
  @Input()
  selectedFloorPlanId: string;
  public availableTables: any[] = [];
  public avlTblesLoading: boolean;
  private updateFloorPlanSubscription: Subscription;

  public config: SwiperConfigInterface = {
    slidesPerView: 4,
    grabCursor: true
  };
  constructor(
    private tableService: TableService,
    private shared: SharedDataService,
    public update: UpdateResultsService,
    private authenticate : AuthenticationService
  ) {
    this.currentUser = this.authenticate.getUser();
    this.updateFloorPlanSubscription = update.updateFloorPlan$.subscribe(() => {
      this.getAvaialabletables();
    });
  }

  ngOnChanges(changes) {
    if (changes.selectedFloorPlanId) {
      this.getAvaialabletables();
    }
  }

  getAvaialabletables() {
    this.avlTblesLoading = true;
    if (this.selectedFloorPlanId) {
      this.tableService
        .getAvailableTables(this.selectedFloorPlanId, this.shared.getClientID())
        .subscribe(
          data => {
            this.availableTables = data;
            this.avlTblesLoading = false;
          },
          error => {
            //ERROR HANDLING
          }
        );
    } else {
      this.avlTblesLoading = false;
    }
  }

  // clear subscription on destroy
  ngOnDestroy() {
    this.updateFloorPlanSubscription.unsubscribe();
  }
}
