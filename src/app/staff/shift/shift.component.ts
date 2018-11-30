import { Component, Inject, OnInit, ViewChild, HostListener } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import * as _ from "underscore";

import { User } from "../../_models/index";
import {
  ShiftService,
  shiftNowModel,
  UnAssignStaffModel,
  sendTextMessage
} from "./shift.service";
import {
  D3TableService,
  LoaderService,
  AlertService,
  PlanRenderService,
  SharedDataService,
  FitToView,
  InitializeService
} from "../../_services";

import { FloorPlanService } from "../../admin/floor-plan/floor-plan.service";
import { AssignServerComponent } from "./assign-server/assign-server.component";
import { ConfirmDialog } from "../../shared";
import { AddEditStaffDialog } from "../add-edit-staff/add-edit-staff.component";
import { AdditionalStaffComponent } from "./additional-staff/additional-staff.component";
import { AuthenticationService } from "../../authentication/authentication.service";
import { WaitlistService, SendMessage } from "../../waitlist/waitlist.service";

export class SelectedSectionLayout {
  layoutID: string;
  createdDate: Date;
  shiftLayoutID: string;
  shitftLayoutName: string;
  totalSections: number;
}

export class ServerOnModel {
  shiftID: string;
  serverID: string;
  sectionID: string;
  clientID: string;
}



@Component({
  selector: "app-shift",
  templateUrl: "shift.component.html",
  styleUrls: ["shift.component.scss"],
  providers: [D3TableService, FloorPlanService, PlanRenderService,WaitlistService]
})
export class ShiftComponent implements OnInit {
  id: string;
  sendmessage: SendMessage = new SendMessage();
  sendtextmessage: sendTextMessage = new sendTextMessage();
  name: string;
  currentUser: User;
  shiftSectionTables: any[] = [];
  tables: any[] = [];
  immovables: any[] = [];
  sectionLayouts: any[] = [];
  floorPlans: any[] = [];
  selectedFloorPlanId: string;
  selectedFloorPlan: any;
  selectedSectionLayoutID: string;
  selectedSectionLayout = new SelectedSectionLayout();
  shiftID: string = "";
  shiftNow: boolean = true;
  shiftSwitched: boolean = false;
  fitToView: FitToView = new FitToView();
  serverOnStatus: boolean = false;
  initials: string;
  zoomValue: number = 1;
  svgScale: number = 1;
  shiftLayoutData: any;
  tableName: any = [];
  otherStaff: any[] = [];
  

  @ViewChild("planContainer")
  planContainer;
  @ViewChild("svgContainer")
  svgContainer;

  constructor(
    private waitlistservice: WaitlistService,
    private shiftService: ShiftService,
    private loaderService: LoaderService,
    private alert: AlertService,
    private planRenderService: PlanRenderService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private shared: SharedDataService,
    private initialize: InitializeService,
    private authenticate  :AuthenticationService
  ) {
    this.loaderService.showLoader(true);
    this.currentUser = this.authenticate.getUser();
  }

  ngOnInit() {
    this.getLayoutLists();
    //this.getAdditionalStaffList();
    this.getAssignedAdditionalStaff();
  }
  
  // get layouots list
  getLayoutLists() {
    this.floorPlans = this.initialize.returnFloorPlanList();
    if (this.floorPlans.length > 0) {
      this.selectFirstItem();
    } else {
      this.loaderService.showLoader(false);
    }
  }

  unAssignOtherStaff(staff: any, index: number) {
    let model = new UnAssignStaffModel();
    model.clientID = this.shared.getClientID();
    model.staffID = staff.id;
    model.shiftID = this.shiftID;
    this.shiftService.unAssignOtherStaff(model).subscribe(
      data => {
        this.otherStaff.splice(index, 1);
        this.alert.success("Unassigned Staff successfully");
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  selectFirstItem() {
    if (this.floorPlans.length) {
      let storedPlan = this.shared.getCurrentFloorPlan();
      if (storedPlan) {
        this.selectedFloorPlan = _.findWhere(this.floorPlans, {
          layoutID: storedPlan.layoutID
        });
      } else {
        this.selectedFloorPlan = _.findWhere(this.floorPlans, {
          isInShift: true
        });
      }
      this.selectedFloorPlan = this.selectedFloorPlan
        ? this.selectedFloorPlan
        : _.first(this.floorPlans);
      this.selectedFloorPlanId = this.selectedFloorPlan.layoutID;
      this.getSectionLayoutsList(this.selectedFloorPlanId);
      this.shared.storeCurrentFloorPlan(this.selectedFloorPlan);
    }
  }

  updateFloorPlan(plan) {
    this.shared.storeCurrentFloorPlan(plan);
    this.selectedFloorPlan = plan;
    this.selectedFloorPlanId = plan.layoutID;
    this.getSectionLayoutsList(plan.layoutID);
  }

  //shift layout change
  shiftLayoutChanged(shiftLayoutId: string) {
    this.selectedSectionLayout = _.findWhere(this.sectionLayouts, {
      shiftLayoutID: shiftLayoutId
    });
    if (this.shiftNow) {
      this.setShiftNow(shiftLayoutId, this.selectedFloorPlanId);
    } else {
      this.setShiftNext(shiftLayoutId, this.selectedFloorPlanId);
    }
  }

  // get section layout list
  getSectionLayoutsList(planId: string) {
    this.shared
      .getSectionLayoutsListWithOnlySections(planId, this.shared.getClientID())
      .subscribe(
        data => {
          this.sectionLayouts = data;
          this.selectedSectionLayout = _.first(this.sectionLayouts);
          if (!this.selectedSectionLayout) {
            this.selectedSectionLayoutID = null;
            this.selectedSectionLayout = new SelectedSectionLayout();
          }
          if (this.shiftNow) {
            this.getShiftNowList(planId);
          } else {
            this.getShiftNextList(planId);
          }
          // this. getAdditionalStaff();
        },
        error => {
          this.loaderService.showLoader(false);
        }
      );
  }

  setShiftNow(shiftLayoutID: string, planID: string) {
    let model = new shiftNowModel();
    model.shiftID = this.shiftID;
    model.shiftLayoutID = shiftLayoutID;
    model.layoutID = planID;
    model.clientID = this.shared.getClientID();
    this.shared.storeShiftLayoutID(shiftLayoutID);
    this.shiftService.setShiftNow(model).subscribe(
      data => {
        this.getShiftNowList(planID);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  setShiftNext(shiftLayoutID: string, planID: string) {
    let model = new shiftNowModel();
    model.shiftID = this.shiftID;
    model.shiftLayoutID = shiftLayoutID;
    model.isShiftNow = false;
    model.layoutID = planID;
    model.clientID = this.shared.getClientID();
    this.shiftService.setShiftNext(model).subscribe(
      data => {
        this.getShiftNextList(planID);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  //get shift now data
  getShiftNowList(planID: string) {
    this.loaderService.showLoader(true);
    this.shiftService
      .getShiftNowList(planID, this.shared.getClientID())
      .subscribe(
        data => {
          this.shiftLayoutData = data.shiftLayout.tables;
          this.shiftNow = true;
          this.shiftSectionTables = _.sortBy(data.shiftSectionTables, function(
            s
          ) {
            return s.section.createdDateTime;
          });
          let serverOnStatus = this.shiftSectionTables.filter(function(n) {
            return n.section.serverStatus.id == 1;
          });
          this.serverOnStatus = serverOnStatus.length > 0 ? true : false;

          this.tables = this.planRenderService.createTables(
            data.shiftLayout,
            this.selectedFloorPlanId,
            data.shiftSectionTables,
            data.shiftLayout.shiftID
          ).tables;
          this.immovables = this.planRenderService.createImmovables(
            data.shiftLayout.immovableStructures,
            0
          );
          this.shiftID = data.shiftLayout.shiftID;
          this.selectedSectionLayout = _.findWhere(this.sectionLayouts, {
            shiftLayoutID: data.shiftLayout.shiftLayoutID
          });
          this.selectedSectionLayoutID = data.shiftLayout.shiftLayoutID;
          if (this.tables) {
            this.fitPlanToView();
          }
          this.loaderService.showLoader(false);
        },
        error => {
          this.alert.error(error.error.message);
          this.loaderService.showLoader(false);
        }
      );
  }

  checkAvailable(tableName) {
    var available;
    _.each(this.shiftLayoutData, function(i) {
      if (i.name == tableName) {
        if (i.tableStatus.id != "Available") {
          available = true;
        } else {
          available = false;
        }
      }
    });
    return available;
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

  //get shift now data
  getShiftNextList(planID: string) {
    this.loaderService.showLoader(true);
    this.shiftService
      .getShiftNextList(planID, this.shared.getClientID())
      .subscribe(
        data => {
          this.shiftNow = false;
          this.shiftSectionTables = data.shiftSectionTables;
          this.tables = this.planRenderService.createTables(
            data.shiftLayout,
            this.selectedFloorPlanId,
            data.shiftSectionTables,
            data.shiftLayout.shiftID
          ).tables;
          this.immovables = this.planRenderService.createImmovables(
            data.shiftLayout.immovableStructures,
            0
          );
          this.shiftID = data.shiftLayout.shiftID;
          this.selectedSectionLayoutID = data.shiftLayout.shiftLayoutID;
          this.loaderService.showLoader(false);
          //this.getAdditionalStaff();
        },
        error => {
          this.loaderService.showLoader(false);
        }
      );
  }

  switchToNextShift(planID: string) {
    this.loaderService.showLoader(true);
    this.shiftService
      .switchToNextShift(planID, this.shared.getClientID())
      .subscribe(
        data => {
          this.shiftNow = true;
          this.shiftSectionTables = data.shiftSectionTables;
          this.tables = this.planRenderService.createTables(
            data.shiftLayout,
            this.selectedFloorPlanId,
            data.shiftSectionTables,
            data.shiftLayout.shiftID
          ).tables;
          this.immovables = this.planRenderService.createImmovables(
            data.shiftLayout.immovableStructures,
            0
          );
          this.shiftID = data.shiftLayout.shiftID;
          this.selectedSectionLayoutID = data.shiftLayout.shiftLayoutID;
          this.loaderService.showLoader(false);
        },
        error => {
          this.alert.error(error.error.message);
          this.loaderService.showLoader(false);
        }
      );
  }

  serverOn(section: any) {
    let model = new ServerOnModel();
    model.shiftID = this.shiftID;
    model.sectionID = section.section.sectionID;
    model.serverID = section.section.serverID;
    model.clientID = this.shared.getClientID();
    this.shiftService.serverOn(model).subscribe(
      data => {
        // section.serverStatus.id = 1;
        this.getShiftNowList(this.selectedFloorPlanId);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  serverCut(section: any) {
    let model = new ServerOnModel();
    model.shiftID = this.shiftID;
    model.sectionID = section.section.sectionID;
    model.serverID = section.section.serverID;
    model.clientID = this.shared.getClientID();
    this.shiftService.serverCut(model).subscribe(
      data => {
        this.getShiftNowList(this.selectedFloorPlanId);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  sendMessageToPager(pager: string, section: any
  ) {
      console.log(this.sendmessage);
      // this.sendmessage.serverID = section.section.serverID;
      this.sendmessage.shiftID = this.shiftID;
      this.sendmessage.pagerNumber = pager;
      this.sendmessage.clientID = this.shared.getClientID();
      this.waitlistservice.sendMessageToPager(this.sendmessage).subscribe(
        data => {
          this.alert.success("paged successfully");
        },
        error => {
          this.alert.error(error.error.errors[0].message);
        }
      );
    } 

    //SEND SMS
    sendTextMessage(id: any) {
      console.log(this.sendtextmessage);
      this.sendtextmessage.messageText = "hello";
      this. sendtextmessage.staffID = id;
      this.sendtextmessage.clientID = this.shared.getClientID();
      this.shiftService.sendTextMessage(this.sendtextmessage).subscribe(
        data => {
          this.loaderService.showLoader(false);
          this.alert.success("Message sent Successfully.");
        },
        error => {
          this.loaderService.showLoader(false);
          this.alert.error(error.errors.message);
        }
      );
    }

  confirmSwitch(planID: string) {
    let existOn = 0;
    _.each(this.shiftSectionTables, function(section) {
      if (section.section.serverStatus.id == 1) {
        existOn = existOn + 1;
      }
    });

    let message =
      existOn > 0
        ? "There are sections which are currently ON. Are you sure you want to Switch? This action cannot be undone."
        : "Are you sure you want to Switch? This action cannot be undone.";

    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "400px",
      disableClose: true,
      data: {
        button: "SWITCH",
        type: "success",
        message: message
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.switchToNextShift(planID);
    });
  }

  confirmOn(section: any) {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "400px",
      disableClose: true,
      data: {
        button: "CONFIRM",
        type: "success",
        message: "Mark Server " + section.server.firstName + " as On?This operation cannot be undone."
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.serverOn(section);
    });
  }

  confirmCut(section: any) {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "CONFIRM",
        type: "danger",
        message:
          "Mark Server " +
          section.server.firstName +
          " " +
          section.server.lastName +
          " as Cut?This operation cannot be undone."
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.serverCut(section);
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  openSectionDetails(section): void {
    let dialogRef = this.dialog.open(ShiftDetailComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        section: section,
        shiftID: this.shiftID,
        shiftNow: this.shiftNow,
        shiftLayoutData: this.shiftLayoutData
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.shiftNow) {
          this.getShiftNowList(this.selectedFloorPlanId);
        } else {
          this.getShiftNextList(this.selectedFloorPlanId);
        }
      }
    });
  }

  assignServereDialog(sectionID, shiftNow, serverID, serverDetails): void {
    let dialogRef = this.dialog.open(AssignServerComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        layoutID: this.selectedFloorPlanId,
        shiftLayoutID: this.selectedSectionLayoutID,
        sectionID: sectionID,
        shiftNow: shiftNow,
        serverID: serverID,
        serverDetails: serverDetails,
        shiftID: this.shiftID
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (shiftNow) {
          this.getShiftNowList(this.selectedFloorPlanId);
        } else {
          this.getShiftNextList(this.selectedFloorPlanId);
        }
        //this.getAdditionalStaffList();
      }
    });
  }

  //additional staff
  assignAdditionalStaffModal(shiftNow: boolean) {
    let dialogRef = this.dialog.open(AdditionalStaffComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        shiftID: this.shiftID
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && shiftNow) {
        this.getShiftNowList(this.selectedFloorPlanId);
        this.getAssignedAdditionalStaff();
      } else if (result) {
        this.getShiftNextList(this.selectedFloorPlanId);
      }
    });
  }

  getAssignedAdditionalStaff() {
    this.shiftService
      .getAssignedAdditionalStaff(this.shared.getClientID())
      .subscribe(
        data => {
          let staff = data.filter(function(n) {
            return n.isManager || n.isKitchenStaff || n.isOther;
          });
          this.otherStaff = staff;
        },
        error => {
          this.alert.error(error.error.message);
        }
      );
  }
}

export class ServingData {
  initials: string;
  description: string;
  id: string;
  serverType: string;
  totalCoversServedToday: number = 0;
  totalCoversServingNow: number = 0;
  totalTablesServedToday: number = 0;
  totalTablesServingNow: number = 0;
}

export class ServerType {
  serverID: string;
  sectionID: string;
  clientID: string;
  isShiftNow: boolean;
  //shiftID : string;
}

@Component({
  selector: "app-shift-detail",
  templateUrl: "shift-detail.component.html",
  styleUrls: ["shift-detail.component.scss"],
  providers: [WaitlistService]
})
export class ShiftDetailComponent {
  currentUser: User;
  servingData: ServingData = new ServingData();
  serverType: ServerType = new ServerType();
  sendmessage: SendMessage = new SendMessage();
  pager: number;

  constructor(
    public dialogRef: MatDialogRef<ShiftDetailComponent>,
    private shiftService: ShiftService,
    private waitlistservice: WaitlistService,
    private shared: SharedDataService,
    public alert: AlertService,
    public loader: LoaderService,
    public dialog: MatDialog,
    private authenticate : AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.currentUser = this.authenticate.getUser();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.serverType.clientID = this.shared.getClientID();
    this.serverType.sectionID = this.data.section.section.sectionID;
    this.serverType.serverID = this.data.section.section.serverID;
    //this.serverType.shiftID = this.data.shiftID;
    this.serverType.isShiftNow = this.data.shiftNow;
    this.getServerDetails();
  }

  getServerDetails() {
    this.shiftService
      .getServerDetails(
        this.data.section.section.sectionID,
        this.shared.getClientID(),
        this.data.shiftNow
      )
      .subscribe(
        data => {
          this.servingData = data;
        },
        error => {}
      );
  }

  confirmCut(section: any) {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "400px",
      disableClose: true,
      data: {
        button: "CONFIRM",
        type: "danger",
        message: "Mark Server " + section.server.firstName + " as Cut?This operation cannot be undone."
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.serverCut(section);
    });
  }

  confirmOn(section: any) {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "400px",
      disableClose: true,
      data: {
        button: "CONFIRM",
        type: "success",
        message: "Mark Server " + section.server.firstName + " as On?This operation cannot be undone."
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.serverOn(section);
    });
  }

  onTypeSelectionChange(type: string) {
    this.shiftService.updateServerType(this.serverType, type).subscribe(
      data => {
        this.alert.success("Staff details updated successfully.");
        this.dialogRef.close(true);
      },
      error => {}
    );
  }

  serverCut(section: any) {
    this.loader.showLoader(true);
    let model = new ServerOnModel();
    model.shiftID = this.data.shiftID;
    model.sectionID = section.section.sectionID;
    model.serverID = section.section.serverID;
    model.clientID = this.shared.getClientID();
    this.shiftService.serverCut(model).subscribe(
      data => {
        this.dialogRef.close(true);
      },
      error => {
        this.alert.error(error.error.message);
        this.loader.showLoader(false);
      }
    );
  }

  serverOn(section: any) {
    let model = new ServerOnModel();
    model.shiftID = this.data.shiftID;
    model.sectionID = section.section.sectionID;
    model.serverID = section.section.serverID;
    model.clientID = this.shared.getClientID();
    this.shiftService.serverOn(model).subscribe(
      data => {
        this.dialogRef.close(true);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
  }

  viewStaff(): void {
    let dialogRef = this.dialog.open(AddEditStaffDialog, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: {
        type: 1,
        server: this.data.section.server,
        serverID: this.servingData.id
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.section.server = result;
        this.alert.success("Staff details updated successfully.");
      }
    });
  }

  checkAvailable(tableName) {
    var available;
    _.each(this.data.shiftLayoutData, function(i) {
      if (i.name == tableName) {
        if (i.tableStatus.id != "Available") {
          available = true;
        } else {
          available = false;
        }
      }
    });
    return available;
  }

  sendMessageToPager(pager: string, section: any
  ) {
      console.log(this.sendmessage);
      this.sendmessage.serverID = this.data.section.section.serverID;
      this.sendmessage.shiftID = this.data.shiftID;
      this.sendmessage.pagerNumber = pager;
      this.sendmessage.clientID = this.shared.getClientID();
      this.waitlistservice.sendMessageToPager(this.sendmessage).subscribe(
        data => {
          this.alert.success("paged successfully");
        },
        error => {
          this.alert.error(error.error.errors[0].message);
        }
      );
    } 
}
