import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { StaffComponent } from "./staff.component";
import { ShiftComponent } from "./shift/shift.component";
import { ShiftLayoutsComponent } from "./shift-layouts/shift-layouts.component";
import { StaffListComponent } from "./staff-list/staff-list.component";
import { ShiftLayoutDetailComponent } from "./shift-layout-detail/shift-layout-detail.component";

const routes: Routes = [
  {
    path: "",
    component: StaffComponent,
    data: {
      title: "Staff"
    },
    children: [
      {
        path: "",
        redirectTo: "/staff/shift",
        pathMatch: "full"
      },
      { path: "shift", component: ShiftComponent },
      { path: "shift-layouts", component: ShiftLayoutsComponent },
      {
        path: "shift-layout-detail/:id/:name",
        component: ShiftLayoutDetailComponent
      },
      { path: "staff-list", component: StaffListComponent },
      { path: "staff-list/:token", component: StaffListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule {}
