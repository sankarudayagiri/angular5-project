import {
  Component,
  Output,
  OnInit,
  Inject,
  Input,
  EventEmitter
} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { SharedDataService, InitializeService } from "../../_services";

@Component({
  selector: "select-floor-plan-btn",
  template: `<i class="material-icons cursor-pointer" (click)="selectFloorPlan()">
                    apps
                </i>`
})
export class SelectFloorPlanBtnComponent {
  @Input()
  floorPlans: any;
  @Input()
  selectedPlanID: string;
  @Output()
  selectedPlanIDChange: EventEmitter<Date> = new EventEmitter();
  constructor(public dialog: MatDialog) {}

  ngOnInit() {}

  selectFloorPlan(): void {
    let dialogRef = this.dialog.open(SelectFloorPlanComponent, {
      width: "100vw",
      panelClass: "full-size-dialog",
      data: { plans: this.floorPlans, selected: this.selectedPlanID }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.selectedPlanIDChange.emit(result);
    });
  }
}

@Component({
  selector: "select-floor-plan",
  templateUrl: "select-floor-plan.component.html"
})
export class SelectFloorPlanComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<SelectFloorPlanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public initialize: InitializeService
  ) {}

  ngOnInit() {
    this.data.plans = this.initialize.returnFloorPlanList();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  selectFloorPlan(plan: any) {
    this.dialogRef.close(plan);
  }
}
