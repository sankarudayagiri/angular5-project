import { Component, OnInit, EventEmitter } from "@angular/core";
import { TapaheadService, TapAhead } from "./tap-ahead.service";
import {
  LoaderService,
  AlertService,
  DiscardDialogService,
  SharedDataService,
  TimeZoneService
} from "../../_services/index";
import { AdminHeaderService } from "./../admin-header/admin-header.service";
import { Observable } from "rxjs";
import {
  FloorPlanService,
  Layout,
  BgImage
} from "../floor-plan/floor-plan.service";
import { HttpClient, HttpRequest, HttpEventType } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { SafeUrl, DomSanitizer } from "@angular/platform-browser";


@Component({
  selector: "app-tapAhead",
  templateUrl: "./tap-ahead.component.html",
  styleUrls: ["./tap-ahead.component.scss"],
  providers: [TapaheadService, DiscardDialogService,FloorPlanService]
})

export class TapaheadComponent implements OnInit {
  tapahead: TapAhead = new TapAhead();
  date: Date = new Date();
  savedata: any;
  discardConfirm: EventEmitter<boolean> = new EventEmitter();
  layout: Layout = new Layout();
  uploadInProgress: boolean = false;
  progress: number;
  bgImageName: string;
  bgImg: BgImage = new BgImage();
  bgImage: SafeUrl;
  bgblobname: string;
  invalidTime: boolean = false;

  constructor(
    private TapaheadService: TapaheadService,
    private AdminHeaderService: AdminHeaderService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private discardService: DiscardDialogService,
    private shared: SharedDataService,
    public tzone : TimeZoneService,
    private floorService: FloorPlanService,
    private http: HttpClient,
    public _DomSanitizer: DomSanitizer,
  ) {
    this.loaderService.showLoader(true);
    this.AdminHeaderService.showAdminHeader(true);
    discardService.confirm$.subscribe(confirm => {
      this.discardConfirm.emit(confirm);
    });
  }

  ngOnInit() {
    let d = new Date();
    let from = new Date(d.setHours(0, 0, 0, 0));
    let to = new Date(d.setHours(23, 59, 59, 0));
    this.tapahead.from = this.tzone.getLocalTime(from);
    this.tapahead.to = this.tzone.getLocalTime(to);
    this.tapaheadSettings();
  }

  tapaheadSettings() {
    this.TapaheadService.getTapahead(this.shared.getClientID()).subscribe(
      data => {
        this.loaderService.showLoader(false);
        data.settings.blobNameForLogo && this.downloadImage(data.settings.blobNameForLogo);
        this.tapahead = data.settings;
        this.tapahead.from = this.tzone.setUTCAsLocal(data.settings.from);
        this.tapahead.to = this.tzone.setUTCAsLocal(data.settings.to);
        this.savedata = JSON.parse(JSON.stringify(this.tapahead));
      },
      error  =>  {
        this.loaderService.showLoader(false);
        this.alertService.error(error.error.message);
      }
    );
  }

  save() {
    this.loaderService.showLoader(true);
    this.tapahead.clientID = this.shared.getClientID();
    this.tapahead.from = this.tzone.getLocalTime(this.tapahead.from);
    this.tapahead.to = this.tzone.getLocalTime(this.tapahead.to);
    //this.tapahead.theme;
    this.TapaheadService.saveTapaheadSettings(this.tapahead).subscribe(data => {
      this.loaderService.showLoader(false);
      this.alertService.success("Tap Ahead Settings saved successfully.");
      this.savedata = JSON.parse(JSON.stringify(this.tapahead));
    },
    error => {
      this.alertService.error(error.error.message);
      this.loaderService.showLoader(false);
    });
  }

  compareTwoDates(r) {
    let from = new Date(r.from).setSeconds(0, 0);
    from = new Date(from).setDate(new Date().getDay());
    let to = new Date(r.to).setSeconds(0, 0);
    to = new Date(to).setDate(new Date().getDay());
    this.invalidTime = r.error ? false : true;
    r.error =
      from.valueOf() >= to.valueOf()
        ? "To time should be greater than From time."
        : null;
  }

  // check for unsaved changes
  canDeactivate(): Observable<boolean> | boolean {
    let rulesNotChanged =
      JSON.stringify(this.savedata) === JSON.stringify(this.tapahead);
    if (rulesNotChanged) {
      return true;
    }
    this.discardService.openDiscardChangesDialog();
    return this.discardConfirm;
  }

  downloadImage(name:  any) {
    let  params  =  {
      blobName:  name,
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
      error  =>  {
        this.loaderService.showLoader(false);
        this.alertService.error(error.error.message);
      }
    );
  }

  upload(files: any) {
    let model: any = {};
    if (files.length === 0) return;
    model.file = files;
    model.LayoutID = this.layout.LayoutID;
    const formData = new FormData();
    for (let file of files) formData.append(file.name, file);
    this.loaderService.showLoader(false);
    const uploadReq = new HttpRequest(
      "POST",
      environment.API + "/floor/admin/uploadfile",
      formData,
      {
        reportProgress: true
      }
    );
    this.loaderService.showLoader(false);
    this.http.request(uploadReq).subscribe(event => {
      if (event.type === HttpEventType.Response) {
        this.tapahead.blobNameForLogo = event.body.toString();
        this.layout.blobName = event.body;
        this.bgImageName = files[0].name;
        this.downloadImage(event.body);
      }
    });
  }
}
