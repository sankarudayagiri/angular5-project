import {
  CommonModule,
  LocationStrategy,
  HashLocationStrategy,
  DatePipe
} from "@angular/common";
import { NgModule } from "@angular/core";

// third party
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { NgCircleProgressModule } from "ng-circle-progress";
import { PopoverModule } from "ngx-bootstrap/popover";
import { ScrollEventModule } from "ngx-scroll-event";
import { TabsModule } from "ngx-bootstrap/tabs";
import {
  SwiperModule,
  SWIPER_CONFIG,
  SwiperConfigInterface
} from "ngx-swiper-wrapper";
import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";

// directives
import {
  ClickStopPropagation,
  D3ZoomableDirective,
  PanelPinToggler
} from "./_directives/index";

//pipes
import { stringTimeToMinutesPipe, ZeroPaddingPipe, TimeAgoPipe } from "./_pipes";

// components
import { AsidePanelComponent } from "./tables/aside-panel/aside-panel.component";
import { AddViewEditDialog } from "./reservation/add-view-edit-dialog.component";
import { AddToReservation } from "./reservation/add-to-reservation/add-to-reservation.component";
import { AddToWaitlistComponent } from "./waitlist/add-to-waitlist/add-to-waitlist.component";
import { AddReservationBtnComponent } from "./reservation/add-reservation-btn.component";
import { AddToWaitListBtnComponent } from "./waitlist/add-waitlist-btn.component";
import { AddLocationBtnComponent } from "./super-admin/add-location-btn.component";
import { quickSeatPartyComponent } from "./tables/quick-seat-party/quick-seat-party.component";
import { ReservatonListComponent } from "./reservation/reservation-list/reservation-list.component";
import { SelectDateComponent } from "./reservation/select-date/select-date.component";
import { SeatedGuestListComponent } from "./tables/seated-guest-list/seated-guest-list.component";
import { SeatPartyComponent } from "./tables/seat-party/seat-party.component";
import { ServerRotationComponent } from "./tables/server-rotation-panel/server-rotation-panel.component";
import { selectSeverlistComponent } from "./tables/select-server-list/select-server-list.component";
import { SeatViewEditDialog } from "./tables/seat-view-edit-dialog.component";
import { SelectWaitlistComponent } from "./waitlist/select-wait-list/select-wait-list.component";
import { SharedComponentsModule } from "./shared/shared-components.module";
import { TimeSlotsComponent } from "./reservation/time-slots/time-slots.component";
import { UserInfoComponent } from "./reservation/user-info/user-info.component";
import { ViewReservationComponent } from "./reservation/view-reservation/view-reservation.component";
import { ViewSeatedPartyComponent } from "./tables/view-seated-party/view-seated-party.component";
import { ViewWaitingPartyComponent } from "./waitlist/view-waiting-party/view-waiting-party.component";
import { WaitlistAddViewEditDialog } from "./waitlist/add-view-edit-dialog.component";
import { WaitListItemsComponent } from "./waitlist/wait-list-items/wait-list-items.component";

//services
import { LoaderService, SessionService } from "./_services";

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  observer: true,
  direction: "horizontal",
  slidesPerView: 3,
  threshold: 30,
  spaceBetween: 0,
  centeredSlides: false,
  mousewheel: true
};

@NgModule({
  imports: [
    BsDropdownModule.forRoot(),
    CommonModule,
    MatPasswordStrengthModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 45,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#2dd1a1",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
      titleColor: "#fff",
      unitsColor: "#aaa",
      titleFontSize: "21",
      showSubtitle: false,
      unitsFontSize: "12"
    }),
    PopoverModule.forRoot(),
    SharedComponentsModule,
    ScrollEventModule,
    SwiperModule,
    TabsModule.forRoot()
  ],

  declarations: [
    AddToReservation,
    AddReservationBtnComponent,
    AddToWaitListBtnComponent,
    AddLocationBtnComponent,
    AddToWaitlistComponent,
    AddViewEditDialog,
    AsidePanelComponent,
    D3ZoomableDirective,
    ClickStopPropagation,
    ViewReservationComponent,
    PanelPinToggler,
    quickSeatPartyComponent,
    ReservatonListComponent,
    SeatPartyComponent,
    SeatViewEditDialog,
    SelectDateComponent,
    SelectWaitlistComponent,
    stringTimeToMinutesPipe,
    selectSeverlistComponent,
    SeatedGuestListComponent,
    ServerRotationComponent,
    TimeSlotsComponent,
    UserInfoComponent,
    ViewSeatedPartyComponent,
    ViewWaitingPartyComponent,
    WaitListItemsComponent,
    WaitlistAddViewEditDialog,
    ZeroPaddingPipe,
    TimeAgoPipe
  ],

  providers: [
    DatePipe,
    LoaderService,
    SessionService,
    stringTimeToMinutesPipe,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    }
  ],

  entryComponents: [
    AddToReservation,
    AddToWaitlistComponent,
    AddViewEditDialog,
    AsidePanelComponent,
    quickSeatPartyComponent,
    ReservatonListComponent,
    SeatViewEditDialog,
    SelectDateComponent,
    SeatedGuestListComponent,
    ServerRotationComponent,
    TimeSlotsComponent,
    ViewReservationComponent,
    WaitListItemsComponent,
    WaitlistAddViewEditDialog
  ],

  exports: [
    AddLocationBtnComponent,
    AddReservationBtnComponent,
    AddToWaitListBtnComponent,
    AsidePanelComponent,
    BsDropdownModule,
    CommonModule,
    ClickStopPropagation,
    D3ZoomableDirective,
    MatPasswordStrengthModule,
    NgCircleProgressModule,
    PanelPinToggler,
    PopoverModule,
    ReservatonListComponent,
    SharedComponentsModule,
    SelectDateComponent,
    stringTimeToMinutesPipe,
    ScrollEventModule,
    SwiperModule,
    SeatedGuestListComponent,
    ServerRotationComponent,
    TabsModule,
    TimeSlotsComponent,
    WaitListItemsComponent,
    ZeroPaddingPipe,
    TimeAgoPipe
  ]
})
export class SharedModule {}
