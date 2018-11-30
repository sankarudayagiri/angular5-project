import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FloorPlanService } from "../floor-plan.service";
import * as _ from "underscore";
import {
  LoaderService,
  AlertService,
  SharedDataService,
  InitializeService
} from "../../../_services/index";
import { AdminHeaderService } from "../../admin-header/admin-header.service";

@Component({
  templateUrl: "./plans.component.html",
  styleUrls: ["./plans.component.scss"],
  providers: [FloorPlanService]
})
export class PlansComponent implements OnInit {
  layouts: any;
  model: any;
  name: string;
  optionsEnabled: number;
  showEditWarning: boolean = false;
  showEditWarningID: number;

  constructor(
    private service: FloorPlanService,
    private AdminHeaderService: AdminHeaderService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private router: Router,
    private shared: SharedDataService,
    private initialize: InitializeService
  ) {
    this.loaderService.showLoader(true);
    this.AdminHeaderService.showAdminHeader(true);
  }

  ngOnInit() {
    this.getLayoutLists();
  }

  getLayoutLists() {
    this.service.getLayoutLists(this.shared.getClientID()).subscribe(
      data => {
        _.each(data, function(i) {
          i.optionsEnabled = false;
        });
        this.layouts = data;
        this.name = "NEW";
        this.loaderService.showLoader(false);
      },
      error => {
        this.loaderService.showLoader(false);
      }
    );
  }

  //create id for duplicate layout
  duplicate(id) {
    return "-" + id;
  }

  //enable options
  enableOptions(id) {
    this.optionsEnabled = id;
  }

  gotoPlan(status: boolean, layoutid: number, name: string) {
    if (!status) {
      this.router.navigate(["/admin/floor-plan/plan-detail", layoutid, name]);
    } else {
      this.showEditWarningID = layoutid;
    }
  }

  deleteLayout(layoutid: string, index: number) {
    this.loaderService.showLoader(true);
    this.service.deleteLayout(layoutid).subscribe(
      () => {
        this.layouts.splice(index, 1);
        this.loaderService.showLoader(false);
        this.alertService.success("Floor Plan is deleted successfully.");
        this.initialize.getFloorPlansList(this.shared.getClientID());
      },
      error => {
        this.loaderService.showLoader(false);
        this.alertService.error(error.error.errors[0].message);
      }
    );
  }

}
