import { Component, Inject} from '@angular/core';
import { AlertService, LoaderService, SharedDataService } from "../../_services/index";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AssignServer, TableService } from '../tables.service';
import { ShiftService} from '../../staff/shift/shift.service';
import { SectionStaffListModel } from '../../staff/shift/assign-server/assign-server.component';
import { ConfirmDialog } from "../../shared";
import { WaitlistAddViewEditDialog } from '../../waitlist/add-view-edit-dialog.component';
import { UpdateResultsService } from '../../_services/update-results.service';

export class Staff {
    colorCode: string;
    firstName: string;
    id: number;
    initials: string;
    isKitchenStaff: boolean;
    isManager: boolean;
    isOther: boolean;
    isServer: boolean;
    lastName: string;
    pager: number;
    phoneNumber: number;
  }

@Component({
    selector: "select-server",
    templateUrl: "./select-server-list.component.html",
    styleUrls: ["./select-server-list.component.scss"],
    providers: [ShiftService]
})

export class selectSeverlistComponent {
    server: AssignServer = new AssignServer();
    sectionStaffListModel: SectionStaffListModel = new SectionStaffListModel();
    staffList: any[] = [];
    selectedFloorPlanId : string;

  constructor(
    private tableService: TableService,
    public alert: AlertService,
    private shared: SharedDataService,
    private loaderService: LoaderService,
    private shiftService: ShiftService,
    public dialogRef: MatDialogRef<WaitlistAddViewEditDialog>,
    public dialog: MatDialog,
    private update : UpdateResultsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  
  ngOnInit() {
    this.getSectionStaffList();
  }
   
  getSectionStaffList() {
    let storedPlan = this.shared.getCurrentFloorPlan();
    this.selectedFloorPlanId = storedPlan.layoutID;
    this.sectionStaffListModel.clientID = this.shared.getClientID();
    this.sectionStaffListModel.layoutID = this.data.table.LayoutID ? this.data.table.LayoutID : this.selectedFloorPlanId;
    this.sectionStaffListModel.shiftLayoutID = this.data.shiftLayoutID;
    this.shiftService.getSectionStaffList(this.sectionStaffListModel).subscribe(
      data => {
        this.staffList = data;
      },
      error => { }
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  assignServer(serverId){
    this.server.serverID = serverId;
    this.server.tableID = this.data.table.id;
    this.server.clientID = this.shared.getClientID();
    this.tableService.assignServer(this.server).subscribe(
      data => {
        this.update.updateFloorPlan(true);
        this.alert.success("Server assigned Successfully.");
        setTimeout(()=> {
          this.dialogRef.close();
        },1000);
      },
      error => {
        this.alert.error(error.error.message);
      }
    );
}

confirmAssignServer(serverId) {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "300px",
      disableClose: true,
      data: {
        button: "Confirm",
        type: "danger",
        message:
          "Are you sure you want to Assign Server?"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.assignServer(serverId);
    });
  }

  
}
