import { NgModule } from "@angular/core";
import { StaffComponent } from "./staff.component";
import { StaffRoutingModule } from "./staff-routing.module";

import { SharedModule } from "../shared.module";
import { AddEditStaffDialog } from "./add-edit-staff/add-edit-staff.component";
import { ShiftService } from "./shift/shift.service";
import { ShiftComponent, ShiftDetailComponent } from "./shift/shift.component";
import { ShiftLayoutsComponent } from "./shift-layouts/shift-layouts.component";
import { ShiftLayoutService } from "./shift-layouts/shift-layouts.service";
import { StaffListService } from "./staff-list/staff-list.service";
import {
  StaffListComponent,
  StaffDeleteComponent
} from "./staff-list/staff-list.component";
import { ShiftLayoutDetailComponent } from "./shift-layout-detail/shift-layout-detail.component";
import { FloorPlanService } from "../admin/floor-plan/floor-plan.service";
import { MatDialogModule } from "@angular/material";
import { AssignServerComponent } from "./shift/assign-server/assign-server.component";
import { AdditionalStaffComponent } from "./shift/additional-staff/additional-staff.component";

@NgModule({
  imports: [StaffRoutingModule, SharedModule, MatDialogModule],
  providers: [
    ShiftService,
    ShiftLayoutService,
    StaffListService,
    FloorPlanService
  ],
  declarations: [
    StaffComponent,
    AddEditStaffDialog,
    ShiftComponent,
    ShiftLayoutsComponent,
    StaffListComponent,
    ShiftLayoutDetailComponent,
    StaffDeleteComponent,
    ShiftDetailComponent,
    AssignServerComponent,
    AdditionalStaffComponent
  ],
  entryComponents: [
    AddEditStaffDialog,
    StaffDeleteComponent,
    ShiftDetailComponent,
    AssignServerComponent,
    AdditionalStaffComponent
  ]
})
export class StaffModule {}
