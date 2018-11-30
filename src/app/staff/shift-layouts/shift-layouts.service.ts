import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../../environments/environment";

export class createSectionLayoutModel {
  id: string = "";
  name: string;
  layoutID: string;
  createdDate: Date = new Date();
  clientID: string;
}

export class floorPlan {
  isActive: boolean;
  layoutID: string;
  layoutName: string = "";
  totalCovers: number;
  totalTables: number;
}

@Injectable()
export class ShiftLayoutService {
  constructor(private http: HttpClient) {}

  getSectionLayoutsList(layoutid: string, clientid: string) {
    return this.http.get<any>(
      environment.API + "/Shift/layout/list/" + layoutid + "/" + clientid
    );
  }

  createSectionLayout(model) {
    return this.http.post<any>(environment.API + "/Shift/layout/create", model);
  }

  updateShiftLayoutName(model) {
    return this.http.post<any>(
      environment.API + "/Shift/layout/editName",
      model
    );
  }

  deleteShiftLayout(id: string, clientid: string) {
    return this.http.post<any>(environment.API + "/Shift/layout/delete", {
      id: id,
      clientID: clientid
    });
  }

  resetShiftLayout(layoutid: string, clientid: string, shiftLayoutid: string) {
    return this.http.post<any>(
      environment.API + "/Shift/layout/resetShiftLayout",
      {
        layoutID: layoutid,
        clientID: clientid,
        shiftLayoutID: shiftLayoutid
      }
    );
  }
}
