import { NgModule } from "@angular/core";
import {
  BrowserModule,
  HAMMER_GESTURE_CONFIG
} from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

// third party modules
import { GestureConfig } from "@angular/material";
import { AlertModule } from "ngx-bootstrap";
import { MaterialModule } from "./material.module";
//import { TimeAgoPipe } from "time-ago-pipe";

// share module
import { SharedModule } from "./shared.module";

//interceptor service
import { JwtInterceptor } from "./_helpers/index";

// components
import {
  AppComponent,
  AppHeaderComponent,
  AppRoutingModule,
  HelpComponent,
  JtechFooterComponent,
  JtechLayoutComponent,
  LayoutComponent,
  LoginComponent,
  ModuleNotEnabledComponent,
  NotificationComponent,
  NotesComponent,
  NotesReminderComponent,
  PageNotFoundComponent,
  SidebarComponent,
  ResetPasswordComponent,
  UnAuthorisedComponent
} from "./index";


// directives
import {
  NAV_DROPDOWN_DIRECTIVES,
  SIDEBAR_TOGGLE_DIRECTIVES
} from "./_directives/index";

// auth guards
import {
  AuthGuard,
  SuperAuthGuard,
  AdminAuthGuard,
  TablesModuleAuthGuard,
  WaitListModuleAuthGuard,
  ReservationModuleAuthGuard,
  FeedbackModuleAuthGuard,
  TapAheadModuleAuthGuard,
  StaffModuleAuthGuard,
  MultiAdminAuthGuard
} from "./authentication/auth.guard";

// shared services
import {
  AlertService,
  TimeZoneService,
  SharedDataService,
  UpdateResultsService,
  InitializeService
} from "./_services/index";

//services
import { AuthenticationService } from "./authentication/authentication.service";
import { AvailableTableService } from "./_services/availableTablesCovers";
import { ClientAdminHeaderService } from "./shared/client-admin-header.service";
import { NotificationService } from "./notification/notification.service";
import { NotesService } from "./notes/notes.service";
import { SettingsService } from "./settings/settings.service";
import { ViewPartyDataService } from "./_services/view-party-data.service";

@NgModule({
  declarations: [
    AppComponent,
    AppHeaderComponent,
    HelpComponent,
    JtechLayoutComponent,
    JtechFooterComponent,
    LayoutComponent,
    LoginComponent,
    ModuleNotEnabledComponent,
    NAV_DROPDOWN_DIRECTIVES,
    NotificationComponent,
    NotesComponent,
    NotesReminderComponent,
    PageNotFoundComponent,
    ResetPasswordComponent,
    SIDEBAR_TOGGLE_DIRECTIVES,
    //TimeAgoPipe,
    SidebarComponent,
    UnAuthorisedComponent
  ],
  imports: [
    AppRoutingModule,
    AlertModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    SharedModule
  ],
  providers: [
    AuthGuard,
    AdminAuthGuard,
    AlertService,
    AuthenticationService,
    AvailableTableService,
    ClientAdminHeaderService,
    FeedbackModuleAuthGuard,
    InitializeService,
    MultiAdminAuthGuard,
    NotificationService,
    NotesService,
    ReservationModuleAuthGuard,
    SuperAuthGuard,
    StaffModuleAuthGuard,
    SharedDataService,
    SettingsService,
    TablesModuleAuthGuard,
    TapAheadModuleAuthGuard,
    TimeZoneService,
    UpdateResultsService,
    ViewPartyDataService,
    WaitListModuleAuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }
  ],
  bootstrap: [AppComponent],
  entryComponents: [NotesReminderComponent, ResetPasswordComponent]
})
export class AppModule {}
