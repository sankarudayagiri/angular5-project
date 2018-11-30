import { Component, OnInit, Input } from "@angular/core";
import { MatDialog } from "@angular/material";
import { SharedDataService, AlertService } from "../../_services";
import { UpdateResultsService } from "../../_services/update-results.service";
import { TableService } from "../tables.service";
import { Panels } from "../../settings/settings.service";

@Component({
  selector: "server-rotation-panel",
  templateUrl: "./server-rotation-panel.component.html",
  styleUrls: ["./server-rotation-panel.component.scss"]
})
export class ServerRotationComponent implements OnInit {
  @Input() rotations: any[] = [];
  @Input() selectedFloorPlanId: string;
  @Input() shiftSectionTables: any[] = [];
  @Input() serverData: any[] = [];
  @Input() panels : Panels;

  constructor(
    public dialog: MatDialog,
    private shared: SharedDataService,
    public update: UpdateResultsService,
    public alert: AlertService,
    public tableService: TableService
  ) {}

  ngOnInit() {
    
  }

  ngOnChanges(changes) {
    if (changes) {
    }
  }
}
