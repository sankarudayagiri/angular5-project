import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import * as _ from "underscore";
import { environment } from "../../../environments/environment";

export class saveSectionsModel {
  shiftLayoutID: string;
  shiftSectionTablesWithSection: shiftSectionTablesWithSection[] = [];
  clientID: string;
}

export class shiftSectionTablesWithSection {
  shiftSectionTables: shiftSectionTables[] = [];
  section: section = new section();
}

export class shiftSectionTables {
  id: string = "";
  tableID: string;
  tableName: string;
}

export class section {
  Name: string;
  sectionID: string = null;
  serverID: string = null;
  serverTypeID: number = 0;
  serverStatusID: number = 0;
  pagerNumber: number = 0;
  colorCode: string;
  name: string;
}

const SECTION_COLORS = [
  "#E57373",
  "#E53935",
  "#F06292",
  "#D81B60",
  "#880E4F",
  "#BA68C8",
  "#8E24AA",
  "#6A1B9A",
  "#D500F9",
  "#7E57C2",
  "#4527A0",
  "#3F51B5",
  "#64B5F6",
  "#1E88E5",
  "#26C6DA",
  "#0097A7",
  "#26A69A",
  "#66BB6A",
  "#2E7D32",
  "#8BC34A",
  "#CDDC39",
  "#00C853",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#795548",
  "#FF5722"
];

@Injectable()
export class ShiftLayoutDetailService {
  sections: shiftSectionTablesWithSection[] = [];

  constructor(private http: HttpClient) {}

  getShiftLayout(id: string, clientid: string) {
    return this.http.get<any>(
      environment.API + "/Shift/layout/" + id + "/" + clientid
    );
  }

  getShiftLayoutSections(data) {
    _.each(data, function(i) {
      delete i.server;
      delete i.section.serverType;
      delete i.section.serverStatus;
      _.each(i.shiftSectionTables, function(t) {
        t.shiftSectionTableID = t.id ? t.id : "";
        delete t.sectionID;
        delete t.shiftLayoutID;
        delete t.id;
        delete t.name;
        delete t.tableName;
      });
    });
    return data;
  }

  saveShiftLayoutWithSections(model) {
    return this.http.post<any>(
      environment.API + "/Shift/layout/savesections",
      model
    );
  }

  // SECTION COLORS
  getSectionColors() {
    return SECTION_COLORS;
  }
}
