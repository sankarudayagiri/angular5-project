import { NgModule } from "@angular/core";
import { ReservationComponent } from "./reservation.component";
import { ReservationRoutingModule } from "./reservation-routing.module";

import { GuestService } from "../_services/index";
import { ReservationService } from "../reservation/reservation.service";

import { SharedModule } from "../shared.module";
import { stringTimeToDatePipe} from "../_pipes";

@NgModule({
  imports: [ReservationRoutingModule, SharedModule],
  providers: [
    ReservationService,
    GuestService,
    stringTimeToDatePipe
  ],
  declarations: [ReservationComponent, stringTimeToDatePipe]
})
export class ReservationModule {}
