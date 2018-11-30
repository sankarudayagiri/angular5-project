import { NgModule } from "@angular/core";
import { TablesComponent } from "./tables.component";
import { TablesRoutingModule } from "./tables-routing.module";

import { GuestService, DiscardDialogService } from "../_services/index";
import { AsideToggleDirective } from "../_directives/aside.directive";

import { SharedModule } from "../shared.module";
import { stringTimeToMinutesPipe, stringTimeToDatePipe } from "../_pipes";
import { TableService } from "./tables.service";

@NgModule({
  imports: [TablesRoutingModule, SharedModule],
  providers: [
    stringTimeToMinutesPipe,
    stringTimeToDatePipe,
    GuestService,
    TableService,
    DiscardDialogService
  ],
  declarations: [
    TablesComponent,
    AsideToggleDirective
  ]
})
export class TablesModule {}
