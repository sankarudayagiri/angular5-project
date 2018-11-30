import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AdminComponent } from "./admin.component";
import { SettingCardsComponent } from "./setting-cards/setting-cards.component";
import { ReservationRuleComponent } from "./reservation-rule/reservation-rule.component";
import { AccountSettingsComponent } from "./account-settings/account-settings.component";
import { GeneralSettingsComponent } from "./general-settings/general-settings.component";
import { FloorPlanComponent } from "./floor-plan/floor-plan.component";
import { PlanDetailComponent } from "./floor-plan/plan-detail/plan-detail.component";
import { PlansComponent } from "./floor-plan/plans/plans.component";
import { PagersParentComponent } from "./pagers/pagers-parent.component";
import { BlastComponent } from "./blast/blast.component";

import { UsersComponent } from "./users/users.component";
import { TapaheadComponent } from "./tap-ahead/tap-ahead.component";
import { CustomizationComponent } from "./customization/customization.component";

import { CanDeactivateGuard } from "../_services";
import { GuestFeedbackComponent } from "./feedback/guest-feedback/guest-feedback.component";
import { FeedbackComponent } from "./feedback/feedback.component";
import { ServerRatingsComponent } from "./feedback/server-ratings/server-ratings.component";
import {
  SuperAuthGuard,
  ReservationModuleAuthGuard,
  TapAheadModuleAuthGuard,
  WaitListModuleAuthGuard,
  FeedbackModuleAuthGuard,
  TablesModuleAuthGuard
} from "../authentication/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: AdminComponent,
    data: {
      title: "Admin"
    },
    children: [
      {
        path: "",
        redirectTo: "/admin/settings",
        pathMatch: "full"
      },
      {
        path: "settings",
        component: SettingCardsComponent,
        data: {
          title: "Settings"
        }
      },
      {
        path: "reservation-rules",
        canActivate: [ReservationModuleAuthGuard],
        component: ReservationRuleComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          title: "Reservation Rules"
        }
      },
      {
        path: "reservation-rules/:token",
        canActivate: [ReservationModuleAuthGuard],
        component: ReservationRuleComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          title: "Reservation Rules"
        }
      },
      {
        path: "account-settings",
        canActivate: [SuperAuthGuard],
        component: AccountSettingsComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          title: "Account Settings"
        }
      },
      {
        path: "profile-settings",
        component: GeneralSettingsComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          title: "Profile Settings"
        }
      },
      {
        path: "pagers",
        component: PagersParentComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          title: "Pager Settings"
        }
      },
      {
        path: "pagers/:token",
        component: PagersParentComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          title: "Pager Settings"
        }
      },
      {
        path: "blast",
        component: BlastComponent,
        data: {
          title: "Blast"
        }
      },
      {
        path: "users",
        component: UsersComponent,
        data: {
          title: "Users"
        }
      },
      {
        path: "tap-ahead",
        component: TapaheadComponent,
        canActivate: [TapAheadModuleAuthGuard, WaitListModuleAuthGuard],
        canDeactivate: [CanDeactivateGuard],
        data: {
          title: "Tap Ahead Settings"
        }
      },
      {
        path: "customization",
        component: CustomizationComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          title: "Customization"
        }
      },
      {
        path: "feedback",
        component: FeedbackComponent,
        canActivate: [FeedbackModuleAuthGuard],
        children: [
          {
            path: "",
            redirectTo: "/admin/feedback/guest-feedback",
            pathMatch: "full"
          },
          {
            path: "guest-feedback",
            component: GuestFeedbackComponent,
            data: {
              title: "Feedback"
            }
          },
          {
            path: "server-ratings",
            component: ServerRatingsComponent,
            data: {
              title: "Feedback"
            }
          }
        ]
      },
      {
        path: "floor-plan",
        canActivate: [TablesModuleAuthGuard],
        component: FloorPlanComponent,
        children: [
          {
            path: "",
            redirectTo: "/admin/floor-plan/plans",
            pathMatch: "full"
          },
          {
            path: "plan-detail/:id/:name",
            component: PlanDetailComponent,
            canDeactivate: [CanDeactivateGuard]
          },
          {
            path: "plans",
            component: PlansComponent,
            data: {
              title: "Floor Plans"
            }
          },
          {
            path: "plans/:token",
            component: PlansComponent,
            data: {
              title: "Floor Plans"
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
