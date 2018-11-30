import { NgModule } from "@angular/core";
import { DashboardComponent } from "./dashboard.component";
import { DashboardRoutingModule } from "./dashboard-routing.module";

import {
  GuestService,
  DiscardDialogService,
  PlanRenderService
} from "../_services/index";
import { DashBoardService } from "../dashboard/dashboard.service";

import { SharedModule } from "../shared.module";
import { stringTimeToDatePipe } from "../_pipes";
import { stringTimeToMinutesPipe } from "../_pipes";
import { TableService } from "../tables/tables.service";
import { WidgetOccupancyComponent } from "./widget-occupancy/widget-occupancy.component";
import { WidgetAvlTablesComponent } from "./widget-avl-tables/widget-avl-tables.component";
import { WidgetRotationComponent } from "./widget-rotation/widget-rotation.component";
import { WidgetWaitlistComponent } from "./widget-waitlist/widget-waitlist.component";
import { WidgetReservationComponent } from "./widget-reservation/widget-reservation.component";

@NgModule({
  imports: [DashboardRoutingModule, SharedModule],
  providers: [
    DashBoardService,
    stringTimeToDatePipe,
    GuestService,
    stringTimeToMinutesPipe,
    DiscardDialogService,
    TableService,
    PlanRenderService
  ],
  declarations: [
    DashboardComponent,
    WidgetOccupancyComponent,
    WidgetAvlTablesComponent,
    WidgetRotationComponent,
    WidgetWaitlistComponent,
    WidgetReservationComponent
  ]
})
export class DashboardModule {}
