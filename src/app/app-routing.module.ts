import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// Layouts
import { LayoutComponent } from "./layout/layout.component";
import { LoginComponent } from "./authentication/login.component";
import { PageNotFoundComponent } from "./not-found.component";
import { UnAuthorisedComponent } from "./unauthorised.component";

import { CanDeactivateGuard } from "./_services";

import {
  AuthGuard,
  SuperAuthGuard,
  AdminAuthGuard,
  MultiAdminAuthGuard,
  TablesModuleAuthGuard,
  ReservationModuleAuthGuard,
  WaitListModuleAuthGuard,
  StaffModuleAuthGuard
} from "./authentication/auth.guard";
import { HelpComponent } from "./help/help.component";
import { ModuleNotEnabledComponent } from "./not-purchased.component";
import { JtechLayoutComponent } from "./jtech-layout/jtech-layout.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "jtech-admin",
    redirectTo: "jtech-admin",
    pathMatch: "full"
  },

  {
    path: "",
    component: JtechLayoutComponent,
    children: [
      {
        path: "jtech-admin",
        canActivate: [SuperAuthGuard],
        loadChildren: "app/super-admin/super-admin.module#SuperAdminModule"
      }
    ]
  },

  {
    path: "",
    redirectTo: "admin",
    pathMatch: "full"
  },
  {
    path: "",
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "admin",
        canActivate: [AdminAuthGuard],
        loadChildren: "app/admin/admin.module#AdminModule"
      },
      //{ path: "multi-unit-users", component: MultiUnitUsersComponent },

      {
        path: "dashboard",
        canActivate: [TablesModuleAuthGuard],
        loadChildren: "app/dashboard/dashboard.module#DashboardModule"
      },
      {
        path: "tables",
        canActivate: [TablesModuleAuthGuard],
        loadChildren: "app/tables/tables.module#TablesModule"
      },
      {
        path: "reservation",
        canActivate: [ReservationModuleAuthGuard],
        loadChildren: "app/reservation/reservation.module#ReservationModule"
      },
      {
        path: "waitlist",
        canActivate: [WaitListModuleAuthGuard],
        loadChildren: "app/waitlist/waitlist.module#WaitlistModule"
      },
      {
        path: "staff",
        canActivate: [StaffModuleAuthGuard],
        loadChildren: "app/staff/staff.module#StaffModule"
      },
      {
        path: "settings",
        loadChildren: "app/settings/settings.module#SettingsModule"
      },
      {
        path: "help",
        component: HelpComponent
      }
    ]
  },
  { path: "unauthorised", component: UnAuthorisedComponent },
  { path: "not-purchased", component: ModuleNotEnabledComponent },
  { path: "**", component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateGuard]
})
export class AppRoutingModule {}
