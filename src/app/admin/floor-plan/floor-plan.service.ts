import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
//import { environment } from "../../../environments/environment";
import { SafeUrl } from "@angular/platform-browser";
import { Cacheable } from "ngx-cacheable";

export class Table {
  id: string = null;
  name: string;
  offsetX: number = 0;
  offsetY: number = 0;
  shape: number;
  height: number;
  width: number;
  totalCovers: number;
  topCovers: number;
  bottomCovers: number;
  leftCovers: number;
  rightCovers: number;
  rotation: number = 0;
  LayoutID: string = "";
  ngID: number = 0;
  tableID: number = 0;
}

export class ImmovableShape {
  id: string = null;
  offsetX: number = 0;
  offsetY: number = 0;
  shape: number;
  height: number;
  width: number;
  rotation: number = 0;
  LayoutID: string = "";
  ngID: number = 0;
}

export class Layout {
  LayoutID: string = "";
  Name: string;
  FileName: string;
  blobName: any;
  immovableStructures: any[] = [];
  tables: any[] = [];
  clientID: number;
  floorPlanWidth: number;
  floorPlanHeight: number;
  showBackgroundImageInTableManagement: boolean = false;
  showBackgroundImageWhileEditingLayout: boolean = true;
  showGridGuidelinesWhileEditingLayout: boolean = true;
  isActive: boolean = true;
}

export class newObject {
  shape: number = 0;
  table: number = 0;
  coords: any;
  barSeat: boolean = false;
}

export class BgImage {
  src: SafeUrl;
  height: number;
  width: number;
  name: string;
}

const TABLESET = [
  {
    shape: 1,
    title: "Square Tables",
    tables: [2, 4, 8]
  },
  {
    shape: 2,
    title: "Rectangle Tables",
    tables: [4, 6, 8, 10, 12]
  },
  {
    shape: 3,
    title: "Round Tables",
    tables: [2, 4, 6]
  }
];

const ROTATION_ANGLES = [-90, -45, 0, 45, 90];

@Injectable()
export class FloorPlanService {
  constructor(private http: HttpClient) {}

  //@Cacheable()
  // getLayoutLists(clientID: string) {
  //   return this.http.get<any>(
  //     environment.API + "/floor/admin/layout/list/" + clientID
  //   );
  // }

  // deleteLayout(id: string) {
  //   return this.http.delete<any>(
  //     environment.API + "/floor/layout/admin/delete/" + id
  //   );
  // }

  //@Cacheable()
  // getLayout(id: string, clientID: string) {
  //   return this.http.get<any>(
  //     environment.API + "/floor/layout/" + id + "/" + clientID
  //   );
  // }

  // saveFloorLayout(layout: any) {
  //   return this.http.post<any>(
  //     environment.API + "/floor/layout/admin/save",
  //     layout
  //   );
  // }

  // uploadBgImage(model) {
  //   return this.http
  //     .post<any>(environment.API + "/floor/admin/uploadfile", model, {reportProgress: true});
  // }

  @Cacheable()
  // downloadBgImage(model): Observable<Blob> {
  //   return this.http.post<any>(
  //     environment.API + "/floor/DownloadFileAsByteArray",
  //     model
  //   );
  // }

  getTableSet() {
    return TABLESET;
  }

  getRotationAngles() {
    return ROTATION_ANGLES;
  }
}
