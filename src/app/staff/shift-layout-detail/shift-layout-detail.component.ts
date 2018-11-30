import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatSnackBar } from "@angular/material";
import * as _ from "underscore";
import { MatDialog } from "@angular/material";

import { User } from "../../_models/index";
import {
  ShiftLayoutDetailService,
  shiftSectionTablesWithSection,
  saveSectionsModel
} from "./shift-layout-detail.service";

import {
  D3TableService,
  LoaderService,
  AlertService,
  PlanRenderService,
  SharedDataService,
  FitToView
} from "../../_services";
import { FloorPlanService } from "../../admin/floor-plan/floor-plan.service";
import { AuthenticationService } from "../../authentication/authentication.service";

@Component({
  templateUrl: "shift-layout-detail.component.html",
  styleUrls: ["shift-layout-detail.component.scss"],
  providers: [
    D3TableService,
    FloorPlanService,
    ShiftLayoutDetailService,
    PlanRenderService
  ]
})
export class ShiftLayoutDetailComponent implements OnInit {
  currentUser: User;
  shiftLayoutID: string;
  tables: any[] = [];
  immovables: any[] = [];
  shiftSectionTables: any[] = [];
  shiftSectionTablesWithSection: shiftSectionTablesWithSection[] = [];
  newSectionName: string;
  selectedSection: shiftSectionTablesWithSection;
  sectionColors: any[] = [];
  shiftLayoutName: string;
  floorPlanName: string;
  totalCovers: number = 0;
  fitToView: FitToView = new FitToView();
  tablesAssigned: boolean = false;
  zoomValue: number = 1;
  svgScale: number = 1;
  invalid: boolean = false;
  @ViewChild("planContainer")
  planContainer;
  @ViewChild("svgContainer")
  svgContainer;

  constructor(
    private shiftLayoutDetailService: ShiftLayoutDetailService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private planRenderService: PlanRenderService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private shared: SharedDataService,
    private authenticate : AuthenticationService
  ) {
    this.loaderService.showLoader(false);
    this.currentUser = this.authenticate.getUser();
  }

  ngOnInit() {
    this.shiftLayoutID = this.route.snapshot.paramMap.get("id");
    this.floorPlanName = this.route.snapshot.paramMap.get("name");
    this.getShiftLayout();
    this.sectionColors = this.shiftLayoutDetailService.getSectionColors();
  }

  // select first section as selected
  selectFirstItem() {
    //this.selectedSection = _.first(this.shiftSectionTablesWithSection);
  }

  //openSnackBar('This is just a preview of the Floor Plan for this Shift !')

  // get layouots list
  getShiftLayout() {
    this.shiftLayoutDetailService
      .getShiftLayout(this.shiftLayoutID, this.shared.getClientID())
      .subscribe(
        data => {
          this.tables = this.planRenderService.createTables(
            data.shiftLayout,
            this.shiftLayoutID,
            data.shiftSectionTables,
            null
          ).tables;
          this.immovables = this.planRenderService.createImmovables(
            data.shiftLayout.immovableStructures,
            0
          );

          this.shiftSectionTablesWithSection = _.sortBy(
            data.shiftSectionTables,
            function (s) {
              return s.section.createdDateTime;
            }
          );

          this.newSectionName =
            "SECTION " + (this.shiftSectionTablesWithSection.length + 1);
          this.selectFirstItem();
          this.shiftLayoutName = data.shiftLayout.shiftLayoutName;
          this.totalCovers = this.getTotalGuestsCount(this.tables);
          if (this.tables) {
            this.fitPlanToView();
          }
          this.loaderService.showLoader(false);
          this.tablesAssigned = this.getTablesAssigned();
        },
        error => {
          this.loaderService.showLoader(false);
        }
      );
  }

  getTotalGuestsCount(tables) {
    let count = 0;
    _.each(tables, function (t) {
      count = count + t.totalCovers;
    });
    return count;
  }

  fitPlanToView() {
    setTimeout(() => {
      this.fitToView = this.planRenderService.fitPlanToView(
        this.planContainer,
        this.svgContainer,
        this.tables,
        this.immovables
      );
      this.zoomValue = this.fitToView.zoomValue;
    }, 100);
  }

  zoomPlan(val: number) {
    if (val == 1 && this.svgScale < 2) {
      this.svgScale = this.svgScale + 0.1;
    } else if (val == -1 && this.svgScale > 1) {
      this.svgScale = this.svgScale - 0.1;
    }
  }

  //select section to update tables
  selectSection(section) {
    let self = this;
    this.selectedSection = section;
    _.each(self.tables, function (t) {
      let table = _.find(self.selectedSection.shiftSectionTables, {
        tableID: t.tableID
      });
      if (table) {
        t.tableColor = self.selectedSection.section.colorCode;
      } else {
        t.tableColor = "#eee";
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  selectTable(id, table) {
    if (this.selectedSection) {
      let isExistInOther, findExistingIndex, selectedTableId;
      _.each(this.shiftSectionTablesWithSection, function (section) {
        let index = _.findIndex(section.shiftSectionTables, {
          tableID: id
        });
        if (index != -1) {
          selectedTableId = _.find(section.shiftSectionTables, {
            tableID: id
          });
          isExistInOther = section;
          findExistingIndex = index;
        }
      });

      let isExist = _.findIndex(this.selectedSection.shiftSectionTables, {
        tableID: id
      });

      if (isExistInOther && isExist == -1) {
        isExistInOther.shiftSectionTables.splice(findExistingIndex, 1);
      }

      if (isExist == -1) {
        this.selectedSection.shiftSectionTables.push({
          id: selectedTableId ? selectedTableId.id : null,
          tableID: id,
          tableName: table.name
        });
        table.chairColor = this.selectedSection.section.colorCode;
        table.tableColor = this.selectedSection.section.colorCode;
      } else {
        this.selectedSection.shiftSectionTables.splice(isExist, 1);
        table.chairColor = "#aeaeae";
        table.tableColor = "#eee";
      }
    } else {
      this.openSnackBar("Please Select or Create a Section to add Table", null);
    }
    this.tablesAssigned = this.getTablesAssigned();
  }

  // add new section
  addSection() {
    let newSection = new shiftSectionTablesWithSection();
    this.shiftSectionTablesWithSection.push(newSection);
    newSection.section.Name = this.newSectionName;
    newSection.section.name = this.newSectionName;
    newSection.section.colorCode = this.sectionColors[
      Math.floor(Math.random() * this.sectionColors.length)
    ];

    this.selectedSection = newSection;
    this.selectSection(newSection);
    this.newSectionName =
      "SECTION " + (this.shiftSectionTablesWithSection.length + 1);
    this.tablesAssigned = this.getTablesAssigned();
  }

  getTablesAssigned() {
    let assignedTables = 0;
    _.each(this.shiftSectionTablesWithSection, function (section) {
      assignedTables = assignedTables + section.shiftSectionTables.length;
    });
    return assignedTables > 0 ? true : false;
  }

  // save section
  saveShiftLayoutSections() {
    this.loaderService.showLoader(true);
    let model = new saveSectionsModel();
    model.shiftLayoutID = this.shiftLayoutID;
    model.clientID = this.shared.getClientID();
    model.shiftSectionTablesWithSection = this.shiftLayoutDetailService.getShiftLayoutSections(
      JSON.parse(JSON.stringify(this.shiftSectionTablesWithSection))
    );
    this.shiftLayoutDetailService.saveShiftLayoutWithSections(model).subscribe(
      data => {
        this.shiftSectionTablesWithSection = data.shiftSectionTables;
        this.getShiftLayout();
        this.alertService.success("Shift Layout saved successfully.");
        //this.loaderService.showLoader(false);
      },
      error => {
        this.loaderService.showLoader(false);
        this.alertService.error(error.error.message);
      }
    );
  }
  checkForSameName() {
    for (let i = 0; i <= this.shiftSectionTablesWithSection.length - 1; i++) {
      if ((this.shiftSectionTablesWithSection[i].section.name).trim().toUpperCase() === this.newSectionName.trim().toUpperCase()) {
        this.invalid = true;
        break;
      }
      else {
        this.invalid = false;
      }
    }

  }
}
