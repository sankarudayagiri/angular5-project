import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared.module";

import {
  SuperAdminComponent,
  SuperAdminRoutingModule,
  SearchComponent
} from "./index";
import {
  JtechUserDetailComponent,
  JtechUsersComponent
} from "./jtech-users/jtech-users.component";
import { JtechUsersService } from "./jtech-users/jtech-users.service";
import { MultiUnitUsersComponent } from "./multi-unit-users/multi-unit-users.component";
import { MultiUnitUserService } from "./multi-unit-users/multi-unit-users.service";

@NgModule({
  imports: [SuperAdminRoutingModule, CommonModule, SharedModule],
  declarations: [
    SuperAdminComponent,
    SearchComponent,
    JtechUsersComponent,
    JtechUserDetailComponent,
    MultiUnitUsersComponent
  ],
  providers: [JtechUsersService, MultiUnitUserService],
  entryComponents: [JtechUserDetailComponent]
})
export class SuperAdminModule {}
