import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../../environments/environment";
import { Cacheable } from "ngx-cacheable";
import { SendMessage } from "../../waitlist/waitlist.service";

export class StaffModel {
  showManagers: boolean = null;
  showServers: boolean = null;
  showKitchenStaff: boolean = null;
  pageNumber: number = 1;
  pageSize: number = 200;
  sortDirection: number = 1;
}

export class Staff {
  colorCode: string;
  firstName: string;
  id: string;
  initials: string;
  isKitchenStaff: boolean;
  isManager: boolean;
  isOther: boolean;
  isServer: boolean;
  lastName: string;
  pager: number;
  phoneNumber: number;
}

export class shiftNowModel {
  shiftID: string;
  shiftLayoutID: string;
  isShiftNow: boolean = true;
  layoutID: string;
  clientID: string;
}

export class UnassignServer {
  sectionID: string;
  serverID: string;
  clientID: string;
  isShiftNow: boolean = true;
}

export class UnAssignStaffModel {
  staffID: string;
  shiftID: string;
  clientID: string;
}
 
export class sendTextMessage{
  clientID: string;
  staffID: string;
  messageText: string;
}

export class AdditionalStaffModel {
  staffIDs: string[] = [];
  shiftID: string;
  clientID: string;
}

@Injectable()
export class ShiftService {
  constructor(private http: HttpClient) {}

  getShiftNowList(id: string, clientid: string) {
    return this.http.get<any>(
      environment.API + "/Shift/now/" + id + "/" + clientid
    );
  }

  getShiftNextList(id: string, clientid: string) {
    return this.http.get<any>(
      environment.API + "/Shift/next/" + id + "/" + clientid
    );
  }

  switchToNextShift(id: string, clientid: string) {
    return this.http.get<any>(
      environment.API + "/Shift/switch/" + id + "/" + clientid
    );
  }

  getStaffList(model) {
    return this.http.post<any>(
      environment.API + "/Shift/layout/stafflist",
      model
    );
  }

  getAllOtherStaffList(clientID: string) {
    return this.http.get<any>(
      environment.API + "/Shift/allOtherStaffList/" + clientID
    );
  }

  unAssignOtherStaff(model: any) {
    return this.http.post<any>(
      environment.API + "/Shift/unAssignStaffFromShift/",
      model
    );
  }

  assignOtherStaffToShift(model: AdditionalStaffModel) {
    return this.http.post<any>(
      environment.API + "/Shift/assignStaffsToShift",
      model
    );
  }

  setShiftNow(model: shiftNowModel) {
    return this.http.post<any>(environment.API + "/Shift/savenow", model);
  }

  setShiftNext(model: shiftNowModel) {
    return this.http.post<any>(environment.API + "/Shift/savenext", model);
  }

// SEND SMSPOST 
   sendTextMessage(model: sendTextMessage) {
    return this.http.post<any>(environment.API + "/textmessage/sendTextMessageToStaff", model);
  }

  getSectionStaffList(model) {
    return this.http.post<any>(
      environment.API + "/Shift/section/serverlist",
      model
    );
  }

  getServerDetails(sectionid: string, clientid: string, shiftnow: boolean) {
    return this.http.get<any>(
      environment.API +
        "/Shift/section/serveringDetails/" +
        sectionid +
        "/" +
        clientid +
        "/" +
        shiftnow
    );
  }

  serverOn(model) {
    return this.http.post<any>(environment.API + "/Shift/server/on", model);
  }

  serverCut(model) {
    return this.http.post<any>(environment.API + "/Shift/server/cut", model);
  }

  assignSectionStaff(model) {
    return this.http.post<any>(environment.API + "/Shift/assignServer", model);
  }

  updateServerType(model, type: string) {
    let url =
      type == "Opener"
        ? environment.API + "/Shift/serverType/opener"
        : type == "Closer"
          ? environment.API + "/Shift/serverType/closer"
          : environment.API + "/Shift/serverType/doubler";
    return this.http.post<any>(url, model);
  }

  unassignServer(model) {
    return this.http.post<any>(
      environment.API + "/Shift/unassignServer",
      model
    );
  }

  getAssignedAdditionalStaff(clientID: string) {
    return this.http.get<any>(
      environment.API + "/Shift/getAdditionalStaffsByClient/" + clientID
    );
  }
}
