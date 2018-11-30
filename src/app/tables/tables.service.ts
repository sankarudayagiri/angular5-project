import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../environments/environment";
import { GuestDetails } from "../_services";
import { Cacheable, CacheBuster } from "ngx-cacheable";
import { Subject } from "rxjs";

export class floorPlan {
  isActive: boolean;
  layoutID: number;
  layoutName: string = "";
  totalCovers: number;
  totalTables: number;
}

export class WaitListStats {
  totalParties: number = 0;
  totalCovers: number = 0;
}

export class ReservationStats {
  totalParties: number = 0;
  totalCovers: number = 0;
}

export class SeatPartyModel {
  tableID: string = "";
  guest: GuestDetails = new GuestDetails();
  seatedTime: string;
  notesToAdd: any[] = [];
  customNotes: string;
  adultCovers: number = 0;
  childCovers: number = 0;
  mealCourseID: string = "";
  serverID: string = null;
  isEvent: boolean = false;
  clientID: string;
}

export class BlockTable {
  // guestID: string;
  tableID: string;
  leftAtTime: Date = new Date();
  clientID: string;
}

export class HoldTable {
  guestID: string;
  tableID: string;
  leftAtTime: Date = new Date();
  clientID: string;
}

export class AssignServer {
  tableID: string;
  serverID: string = null;
  clientID: string;
}

export class quickSeatParty {
  tableID: string;
  seatedTime: string;
  adultCovers: number = 1;
  childCovers: number = 0;
  isEvent: boolean = false;
  clientID: string;
}

export class TextMessage {
  messageText: string;
  tableID: string;
  clientID: string;
  saveMessage: boolean = false;
  isFromWeb: boolean = true;
}

const cacheBuster$ = new Subject<void>();

@Injectable()
export class TableService {
  public floorPlans: Array<any> = [];
  constructor(private http: HttpClient) {}

  // get saved floor plan list
  getPreSavedFloorPlans() {
    return this.floorPlans;
  }

  seatParty(model) {
    return this.http.post<any>(
      environment.API + "/Floor/table/seatParty",
      model
    );
  }

  getTableDetails(tableid: string, clientid: string) {
    return this.http.get<any>(
      environment.API + "/floor/table/" + tableid + "/" + clientid
    );
  }

  //block table
  blockTable(model) {
    return this.http.post<any>(environment.API + "/Floor/table/block", model);
  }

  //hold table
  holdTable(model) {
    return this.http.post<any>(environment.API + "/Floor/table/hold", model);
  }

  //release table
  releaseTable(model) {
    return this.http.post<any>(environment.API + "/Floor/table/release", model);
  }


  assignServer(model) {
    return this.http.post<any>(
      environment.API + "/Floor/table/assignserver",
      model
    );
  }

  quickSeatParty(model) {
    return this.http.post<any>(
      environment.API + "/Floor/table/quickSeatParty",
      model
    );
  }

  //send message
  tableDetailTextMessage(model) {
    return this.http.post<any>(
      environment.API + "/textmessage/sendTableDetailTextMessage",
      model
    );
  }

  updateParty(model) {
    return this.http.post<any>(environment.API + "/Floor/table/update", model);
  }


  tablesMerge(model) {
    return this.http.post<any>(environment.API + "/Floor/table/merge", model);
  }

  tablesUnlink(model) {
    return this.http.post<any>(environment.API + "/Floor/table/unmerge", model);
  }


  tablesUndoSeating(tableid: string, clientid: string) {
    return this.http.get<any>(
      environment.API + "/Floor/undoSeating/" + tableid + "/" + clientid
    );
  }

  getSeatedGuest(layoutid: string, clientid: string) {
    return this.http.get<any>(
      environment.API + "/Floor/seatedguest/" + layoutid + "/" + clientid
    );
  }

  currentOccupancies(layoutid: string, clientid: string) {
    return this.http.get<any>(
      environment.API + "/dashboard/Occupancy/" + layoutid + "/" + clientid
    );
  }

  tableRotation(layoutid: string, clientid: string) {
    return this.http.get<any>(
      environment.API + "/dashboard/rotation/" + layoutid + "/" + clientid
    );
  }

  getAvailableTables(layoutid: string, clientid: string) {
    return this.http.get<any>(
      environment.API +
        "/dashboard/availabletables/" +
        layoutid +
        "/" +
        clientid
    );
  }
}
