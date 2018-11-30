import {
  Component,
  OnInit,
  ViewChild,
  EventEmitter,
  Inject
} from "@angular/core";
import "rxjs/add/observable/fromEvent";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import * as _ from "underscore";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpRequest, HttpEventType } from "@angular/common/http";
import {
  FloorPlanService,
  Table,
  Layout,
  ImmovableShape,
  newObject,
  BgImage
} from "../floor-plan.service";
import {
  LoaderService,
  AlertService,
  DiscardDialogService,
  PlanRenderService,
  SharedDataService,
  InitializeService
} from "../../../_services";
import { AdminHeaderService } from "../../admin-header/admin-header.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { MatSnackBar } from "@angular/material";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { CreateNewMapDialog } from "./create-new.component";

@Component({
  selector: "app-create-layout",
  templateUrl: "./plan-detail.component.html",
  styleUrls: ["./plan-detail.component.scss"],
  providers: [FloorPlanService, DiscardDialogService]
})
export class PlanDetailComponent implements OnInit {
  layout: Layout = new Layout();
  createTableSet: any[] = [];
  rotationAngles: number[] = [];
  selectedItemID: number;
  rotationEnabled: boolean = false;
  rotation: number = 0;
  position = { x: 0, y: 0 };
  newObject: newObject = new newObject();
  newTable: Table = new Table();
  newImmovableShape: ImmovableShape = new ImmovableShape();
  selectedItem: any;
  itemSettingsEnabled: boolean = false;
  layoutSettingsEnabled: boolean = false;
  stepValue: number = 1;
  minChairs: number = 1;
  maxChairs: number = 16;
  selectedItemType: number;
  uploadInProgress: boolean = false;
  progress: number;
  message: string;
  intervalInstance: any;
  bgImage: SafeUrl;
  imageToShow: any;
  blobName: any;
  bgImageName: string;
  zoomValue: number = 1;
  maxLength: number = 5;
  duplicateTableName: boolean = false;
  discardConfirm: EventEmitter<boolean> = new EventEmitter();
  savedData: any;
  layoutLoaded: boolean = true;
  canLeave: boolean = false;
  deletedTableIDs: any[] = [];
  deletedImmovableStructureIDs: any[] = [];
  planDuplicate: boolean = false;
  delAllTables: boolean = false;
  delAllShapes: boolean = false;
  bgImg: BgImage = new BgImage();
  lastSelectedTableId: string;
  movingObject: any;
  movingObjectShape: number;
  draggerPositionX: number = 0;
  draggerPositionY: number = 0;
  mouseMoveEvent: any;

  @ViewChild("planContainer")
  planContainer;
  @ViewChild("svgContainer")
  svgContainer;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private floorService: FloorPlanService,
    private planRenderService: PlanRenderService,
    private loaderService: LoaderService,
    private discardService: DiscardDialogService,
    private alertService: AlertService,
    private AdminHeaderService: AdminHeaderService,
    public dialog: MatDialog,
    private http: HttpClient,
    public _DomSanitizer: DomSanitizer,
    public snackBar: MatSnackBar,
    private shared: SharedDataService,
    private initialize: InitializeService
  ) {
    this.loaderService.showLoader(true);
    this.AdminHeaderService.showAdminHeader(false);
    this.createTableSet = this.floorService.getTableSet();
    this.rotationAngles = this.floorService.getRotationAngles();
    this.intervalInstance = setInterval(() => {
      this.saveFloorLayout(1);
    }, 120000);
    discardService.confirm$.subscribe(confirm => {
      this.discardConfirm.emit(confirm);
    });
  }

  ngOnInit() {
    let lyID = this.route.snapshot.paramMap.get("id");
    this.layout.Name = this.route.snapshot.paramMap.get("name");
    let chr = lyID.substring(0, 1);
    this.planDuplicate = chr === "-" ? true : false;
    this.layout.LayoutID = this.planDuplicate
      ? lyID.slice(1, lyID.length)
      : lyID;

    if (this.layout.LayoutID === "") {
      setTimeout(() => {
        this.loaderService.showLoader(false);
        this.openDialog();
      });
    } else if (this.planDuplicate) {
      this.layout.Name = this.layout.Name + "(copy)";
      setTimeout(() => {
        this.loaderService.showLoader(false);
        this.openDialog();
        this.getLayout(false);
      });
    } else {
      this.getLayout(false);
    }
  }

  //zoom floor plan editor
  zoomPlan(val: number) {
    let newVal;
    if (val == 1 && this.zoomValue < 1.4) {
      newVal = +this.zoomValue + 0.1;
      newVal = newVal.toFixed(1);
      this.zoomValue = newVal;
    } else if (val == -1 && this.zoomValue > 0.6) {
      newVal = +this.zoomValue - 0.1;
      newVal = newVal.toFixed(1);
      this.zoomValue = newVal;
    }
  }

  upload(files: any) {
    let model: any = {};
    this.uploadInProgress = true;
    if (files.length === 0) return;
    model.file = files;
    model.LayoutID = this.layout.LayoutID;
    const formData = new FormData();
    for (let file of files) formData.append(file.name, file);

    const uploadReq = new HttpRequest(
      "POST",
      environment.API + "/floor/admin/uploadfile",
      formData,
      {
        reportProgress: true
      }
    );

    this.http.request(uploadReq).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        this.progress = Math.round((100 * event.loaded) / event.total);
      } else if (event.type === HttpEventType.Response) {
        this.message = event.body.toString();
        this.uploadInProgress = false;
        this.layout.blobName = event.body;
        this.bgImageName = files[0].name;
        this.downloadImage(event.body, this.bgImageName);
      }
    });
  }

  downloadImage(name: any, fileName: string) {
    let params = {
      BlobName: name
    };
    this.floorService.downloadBgImage(params).subscribe(
      data => {
        let self = this;
        let img = new Image();
        img.src = "data:image/png;base64," + data;
        self.bgImg.src = img.src;
        img.onload = function() {
          self.bgImg.src = img.src;
          self.bgImg.height = img.height;
          self.bgImg.width = img.width;
        };
        this.loaderService.showLoader(false);
      },
      error => {
        this.loaderService.showLoader(false);
        this.alertService.error(error.error.message);
      }
    );
  }

  openDialog(): void {
    this.canLeave = true;
    let dialogRef = this.dialog.open(CreateNewMapDialog, {
      width: "400px",
      height: "220px",
      hasBackdrop: true,
      disableClose: true,
      data: { name: this.layout.Name }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.layout.Name = result;
        this.layout.LayoutID = "";
        this.saveFloorLayout(0);
      }
    });
  }

  // get layout results
  getLayout(clearcache: boolean) {
    this.loaderService.showLoader(true);
    this.floorService
      .getLayout(this.layout.LayoutID, this.shared.getClientID())
      .subscribe(
        data => {
          this.itemSettingsEnabled = false;
          let LayoutID = this.planDuplicate ? "" : this.layout.LayoutID;
          this.layout = data;
          this.layout.tables = this.planRenderService.createTables(
            data,
            LayoutID,
            null,
            null
          ).tables;
          this.layout.immovableStructures = this.planRenderService.createImmovables(
            data.immovableStructures,
            LayoutID
          );
          this.layout.LayoutID = this.route.snapshot.paramMap.get("id");
          this.layout.Name = this.route.snapshot.paramMap.get("name");
          this.bgImageName = data.fileName;
          if (data.blobName) {
            this.downloadImage(data.blobName, data.FileName);
            //this.transformFloorPlan();
          } else {
            this.loaderService.showLoader(false);
            //this.transformFloorPlan();
          }
          this.loaderService.showLoader(false);
          setTimeout(() => {
            this.savedData = JSON.parse(JSON.stringify(this.layout));
          }, 100);
        },
        error => {
          this.loaderService.showLoader(false);
          this.alertService.error(error.error.message);
          this.canLeave = true;
        }
      );
  }

  transformFloorPlan() {
    setTimeout(() => {
      let pw = Math.round(this.planContainer.nativeElement.getBBox().width),
        //ph = Math.round(this.planContainer.nativeElement.getBBox().height),
        svgW: number = this.svgContainer.nativeElement.parentNode.clientWidth, // test this in firefox
        //svgH = this.svgContainer.nativeElement.parentNode.clientHeight,
        offset = 40;
      let minX = Math.min.apply(
        Math,
        this.layout.tables.map(function(t) {
          return t.offsetX;
        })
      );
      let zoomValue = pw > svgW ? svgW / (pw + minX + offset) : 1;
      this.zoomValue = Number(zoomValue.toFixed(1));
    }, 10);
  }

  //create new table
  dragTocreateNewTable(shape: number, table: number, barSeat: boolean) {
    this.canLeave = false;
    this.newObject = new newObject();
    this.newObject.shape = shape;
    this.newObject.table = table;
    this.newObject.barSeat = barSeat;
  }

  onStart(object, shape) {
    let self = this;
    this.movingObject = object;
    this.movingObjectShape = shape;

    this.mouseMoveEvent = Observable.fromEvent(
      document.body,
      "mousemove"
    ).subscribe(e => {
      updateDragPosition(e);
    });
    function updateDragPosition(e: any) {
      self.draggerPositionX = e.clientX;
      self.draggerPositionY = e.clientY;
    }
  }

  onStop() {
    this.movingObject = null;
    this.movingObjectShape = null;
    this.draggerPositionX = 0;
    this.draggerPositionY = 0;
    this.mouseMoveEvent.unsubscribe();
  }

  checkDuplicateExist(name: any) {
    let i = name;
    for (i; i++; ) {
      let isExist = this.layout.tables.filter(function(t) {
        return t.name == i;
      });
      if (isExist.length == 0) {
        break;
      }
    }
    return i;
  }

  createNewTable() {
    let tblName = !this.layout.tables.length ? 0 : this.layout.tables.length;
    tblName = this.checkDuplicateExist(tblName);
    setTimeout(() => {
      this.position = { x: 0, y: 0 };
      let n = this.newObject,
        t = this.newTable;
      t.LayoutID = this.layout.LayoutID ? this.layout.LayoutID : "";
      let nt =
        n.coords && n.shape
          ? this.planRenderService.createNewTable(t, n, JSON.stringify(tblName))
          : undefined;
      let nObj = Object.assign({}, nt);
      if (nt) this.layout.tables.push(nObj);
    }, 100);
  }

  createNewImmovableShape() {
    this.position = { x: 0, y: 0 };
    let n = this.newObject,
      s = this.newImmovableShape;
    s.LayoutID = this.layout.LayoutID ? this.layout.LayoutID : "";
    let ns = n.coords
      ? this.planRenderService.createNewImmovableShape(s, n)
      : undefined;
    let nObj = Object.assign({}, ns);
    if (ns) this.layout.immovableStructures.push(nObj);
  }

  //table duplicate
  itemDuplicate() {
    let svgW: number = this.svgContainer.nativeElement.clientWidth,
      svgH = this.svgContainer.nativeElement.clientHeight,
      tblName = !this.layout.tables.length ? 0 : this.layout.tables.length;
    tblName = this.checkDuplicateExist(tblName);

    if (this.selectedItemType === 0) {
      let t = _.findWhere(this.layout.tables, { ngID: this.selectedItemID });
      let nt = Object.assign({}, t);
      this.layout.tables.push(
        this.planRenderService.duplicateItem(nt, tblName, svgW, svgH)
      );
    } else {
      let item = _.findWhere(this.layout.immovableStructures, {
        ngID: this.selectedItemID
      });
      let nt = Object.assign({}, item);
      this.layout.immovableStructures.push(
        this.planRenderService.duplicateItem(nt, tblName, svgW, svgH)
      );
    }
  }

  //select table
  selectItem(ngid: number, type: number, element) {
    this.itemSettingsEnabled = false;
    this.selectedItemID = ngid;
    this.selectedItemType = type;
    this.rotationEnabled = false;
  }

  //table settings
  itemSettings() {
    this.itemSettingsEnabled = true;
    let item = _.findWhere(this.layout.immovableStructures, {
      ngID: this.selectedItemID
    });

    //this.lastSelectedTableId = item.id;
    let t = _.findWhere(this.layout.tables, { ngID: this.selectedItemID });
    this.selectedItem = this.selectedItemType === 0 ? t : item;
    this.maxLength = this.selectedItemType === 0 ? 5 : 15;
    if (t) {
      // this.stepValue =
      //   t.shape == 1 && this.selectedItem.totalCovers > 3
      //     ? 4
      //     : t.shape == 2
      //       ? 2
      //       : 1;
      // this.minChairs = t.shape == 1 ? 2 : t.shape == 2 ? 4 : 1;
      this.stepValue = 1;
      this.minChairs = 1;
    }
  }

  //check for duplicate name
  tableNameChanged(val: string) {
    let name =
      this.selectedItemType === 0
        ? _.findWhere(this.layout.tables, { name: val })
        : null;
    this.duplicateTableName = name ? true : false;
    this.selectedItem.error = this.duplicateTableName ? true : false;
  }

  //update chairs from settings
  updateTable() {
    let t = _.findWhere(this.layout.tables, { ngID: this.selectedItemID });
    this.stepValue = 1;
    t = this.planRenderService.updateTable(t);
  }

  // update rotation
  updateItemRotation(angle: number) {
    this.rotation = angle;
    let item = _.findWhere(this.layout.immovableStructures, {
      ngID: this.selectedItemID
    });
    let t = _.findWhere(this.layout.tables, { ngID: this.selectedItemID });
    if (t) {
      t.rotation = angle;
    } else {
      item.rotation = angle;
    }
  }

  //table delete
  itemDelete(ngid: number, type: number) {
    this.itemSettingsEnabled = false;
    if (type == 0) {
      let t = _.findWhere(this.layout.tables, { ngID: this.selectedItemID });
      this.deletedTableIDs.push(t.id);
      this.layout.tables.splice(
        _.findIndex(this.layout.tables, { ngID: ngid }),
        1
      );
    } else {
      let item = _.findWhere(this.layout.immovableStructures, {
        ngID: this.selectedItemID
      });
      this.deletedImmovableStructureIDs.push(item.id);
      this.layout.immovableStructures.splice(
        _.findIndex(this.layout.immovableStructures, { ngID: ngid }),
        1
      );
    }
  }

  //delete staff
  deleteAllObjects(tables: boolean, shapes: boolean): void {
    let dialogRef = this.dialog.open(DeleteAllComponent, {
      width: "360px",
      data: { tables: tables, shapes: shapes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (tables) {
          this.deletedTableIDs = _.pluck(this.layout.tables, "id");
          this.delAllTables = false;
          this.layout.tables = [];
        }
        if (shapes) {
          this.deletedImmovableStructureIDs = _.pluck(
            this.layout.immovableStructures,
            "id"
          );
          this.layout.immovableStructures = [];
          this.delAllShapes = false;
          // this.dialogRef.close();
        }
      }
    });
  }

  // clear table selection
  clearTableSelection(e: Event) {
    if (e.srcElement.id === "svgContainer" || e.srcElement.id === "bgImg") {
      this.selectedItemID = null;
      this.itemSettingsEnabled = false;
    } else {
      this.selectedItemID = this.selectedItemID;
    }
  }

  //save the floor plan
  clickSaveFloorLayout() {
    this.saveFloorLayout(0);
  }

  saveFloorLayout(status: number) {
    var fitToView = this.planRenderService.fitPlanToView(
      this.planContainer,
      this.svgContainer,
      this.layout.tables,
      this.layout.immovableStructures
    );
    var width =
      fitToView.width > this.svgContainer.nativeElement.parentNode.clientWidth
        ? this.planContainer.nativeElement.getBBox().width
        : this.svgContainer.nativeElement.parentNode.clientWidth;

    var height =
      fitToView.height > this.svgContainer.nativeElement.parentNode.clientHeight
        ? this.planContainer.nativeElement.getBBox().height
        : this.svgContainer.nativeElement.parentNode.clientHeight;
    let errorInTables = _.findWhere(this.layout.tables, { error: true });
    if (errorInTables) {
      this.alertService.error("Please fix duplicate names and continue.");
    } else {
      if (status == 0) this.loaderService.showLoader(true);
      let layout = JSON.parse(JSON.stringify(this.layout));
      layout.clientID = this.shared.getClientID();
      layout.floorPlanWidth = Math.round(width);
      layout.floorPlanHeight = Math.round(height);
      layout.immovableStructures = this.planRenderService.trimImmovableProperties(
        JSON.parse(JSON.stringify(this.layout.immovableStructures))
      );
      layout.tables = this.planRenderService.trimTableProperties(
        JSON.parse(JSON.stringify(this.layout.tables))
      );

      layout.deletedTableIDs = this.deletedTableIDs;
      layout.deletedImmovableStructureIDs = this.deletedImmovableStructureIDs;
      delete layout.layoutName;
      this.floorService.saveFloorLayout(layout).subscribe(
        data => {
          this.loaderService.showLoader(false);
          this.alertService.success("Floor Plan saved successfully.");
          this.canLeave = true;
          this.router.navigate([
            "/admin/floor-plan/plan-detail",
            data.id,
            data.name
          ]);
          this.layout.LayoutID = data.id;
          this.layout.Name = data.name;
          this.planDuplicate = false;
          this.deletedTableIDs = [];
          this.deletedImmovableStructureIDs = [];
          this.getLayout(true);
        },
        error => {
          this.loaderService.showLoader(false);
          if (Array.isArray(error.error.errors)) {
            this.alertService.error(error.error.errors[0].message);
          } else {
            this.alertService.error(error.error.message);
          }
        }
      );
    }
  }

  // check for unsaved changes
  canDeactivate(): Observable<boolean> | boolean {
    let layoutNotChanged =
      JSON.stringify(this.savedData) === JSON.stringify(this.layout);
    if (this.canLeave) return true;
    else if (layoutNotChanged) return true;
    this.discardService.openDiscardChangesDialog();
    return this.discardConfirm;
  }

  // clear interval on destroy
  ngOnDestroy() {
    this.initialize.getFloorPlansList(this.shared.getClientID());
    clearInterval(this.intervalInstance);
  }
}

@Component({
  templateUrl: "all-delete.component.html"
})
export class DeleteAllComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteAllComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  delete() {
    this.dialogRef.close(true);
  }
}
