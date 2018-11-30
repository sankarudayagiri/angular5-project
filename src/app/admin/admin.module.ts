import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule } from "@angular/material";
import { AngularDraggableModule } from "angular2-draggable";
import { SharedModule } from "../shared.module";
import { ReactiveFormsModule } from "@angular/forms";

import {
  AdminComponent,
  AdminRoutingModule,
  AdminHeaderComponent,
  AccountSettingsComponent,
  BlastComponent,
  CustomizationComponent,
  FloorPlanComponent,
  PlansComponent,
  PlanDetailComponent,
  GeneralSettingsComponent,
  PagersComponent,
  ReservationRuleComponent,
  SettingCardsComponent,
  TapaheadComponent,
  PagersParentComponent,
  CreateNewMapDialog
} from "./index";

import { PlanRenderService, D3TableService } from "../_services";
import { AdminHeaderService } from "./admin-header/admin-header.service";
import { UsersComponent, UserDetailComponent } from "./users/users.component";

import {
  D3DragDirective,
  D3ResizeDirective,
  D3MouseEnterDirective,
  //D3ZoomableDirective,
  BreadcrumbsComponent
} from "../_directives";

import { DeleteAllComponent } from "./floor-plan/plan-detail/plan-detail.component";
import { UsersService } from "./users/users.service";
import { JtechAdminService } from "../super-admin/search/search.service";
import { ServerRatingsComponent } from "./feedback/server-ratings/server-ratings.component";
import { GuestFeedbackComponent } from "./feedback/guest-feedback/guest-feedback.component";
import { FeedbackComponent } from "./feedback/feedback.component";

@NgModule({
  imports: [
    AdminRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    AngularDraggableModule,
    SharedModule,
    MatDialogModule
  ],
  declarations: [
    AdminComponent,
    ReservationRuleComponent,
    SettingCardsComponent,
    AccountSettingsComponent,
    GeneralSettingsComponent,
    FloorPlanComponent,
    AdminHeaderComponent,
    PlansComponent,
    PlanDetailComponent,
    PagersComponent,
    BlastComponent,
    TapaheadComponent,
    CustomizationComponent,
    D3DragDirective,
    D3ResizeDirective,
    D3MouseEnterDirective,
    //D3ZoomableDirective,
    PagersParentComponent,
    CreateNewMapDialog,
    BreadcrumbsComponent,
    DeleteAllComponent,
    UsersComponent,
    UserDetailComponent,
    FeedbackComponent,
    GuestFeedbackComponent,
    ServerRatingsComponent
  ],
  providers: [
    D3TableService,
    AdminHeaderService,
    PlanRenderService,
    UsersService,
    JtechAdminService
  ],
  entryComponents: [UserDetailComponent, CreateNewMapDialog, DeleteAllComponent, FeedbackComponent]
})
export class AdminModule {}
