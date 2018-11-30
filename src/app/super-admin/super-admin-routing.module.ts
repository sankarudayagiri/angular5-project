import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SuperAdminComponent } from "./super-admin.component";
import { SearchComponent } from "./search/search.component";
import { JtechUsersComponent } from "./jtech-users/jtech-users.component";
import { MultiUnitUsersComponent } from "./multi-unit-users/multi-unit-users.component";

const routes: Routes = [
  {
    path: "",
    component: SuperAdminComponent,
    children: [
      {
        path: "",
        redirectTo: "/jtech-admin/search",
        pathMatch: "full"
      },
      {
        path: "search",
        component: SearchComponent,
        data: {
          title: "Jtech Search"
        }
      },
      {
        path: "users",
        component: JtechUsersComponent,
        data: {
          title: "Jtech Users"
        }
      },
      {
        path: "multi-unit-users",
        component: MultiUnitUsersComponent,
        data: {
          title: "Multi unit Users"
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminRoutingModule {}
