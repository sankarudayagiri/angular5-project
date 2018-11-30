import { NgModule } from "@angular/core";
import { WaitlistComponent } from "./waitlist.component";
import { WaitlistRoutingModule } from "./waitlist-routing.module";

import { GuestService, DiscardDialogService } from "../_services/index";
import { WaitlistService } from "./waitlist.service";

import { SharedModule } from "../shared.module";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { AddToListComponent } from "./addList/add-list.component";


@NgModule({
  imports: [WaitlistRoutingModule, SharedModule, MatProgressBarModule],
  providers: [WaitlistService, GuestService, DiscardDialogService],
  declarations: [
    WaitlistComponent,
    AddToListComponent
  ],
  entryComponents: [AddToListComponent]
})
export class WaitlistModule {}
