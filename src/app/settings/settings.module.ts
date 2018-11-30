import { NgModule } from "@angular/core";

import { SettingsComponent } from "./settings.component";
import { SettingsRoutingModule } from "./settings-routing.module";
import { SettingsService } from "./settings.service";
import { SharedModule } from "../shared.module";

@NgModule({
  imports: [SharedModule, SettingsRoutingModule],
  providers: [SettingsService],
  declarations: [SettingsComponent]
})
export class SettingsModule {}
