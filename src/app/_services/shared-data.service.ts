import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
//import { environment } from "../../environments/environment";
import { SessionService } from "./session.service";
import { Subject } from "rxjs/Subject";
import { DatePipe } from "@angular/common";
import { Cacheable } from "ngx-cacheable";

export class ModuleStatus {
  hasModuleReservations: boolean = true;
  hasModuleServerRatings: boolean = false;
  hasModuleStaff: boolean = true;
  hasModuleTable: boolean = true;
  hasModuleTapAheadSeating: boolean = false;
  hasModuleWaitList: boolean = false;
}

@Injectable()
export class SharedDataService {
  private showSidebar = new Subject<boolean>();
  showSidebar$ = this.showSidebar.asObservable();
  private updateBadgerCount = new Subject<boolean>();
  updateBadgerCount$ = this.updateBadgerCount.asObservable();
  constructor(private http: HttpClient, private session: SessionService) {}

  // @Cacheable()
  // getSectionLayoutsList(layoutId: string, clientId: string) {
  //   return this.http.get<any>(
  //     environment.API + "/Shift/layout/list/" + layoutId + "/" + clientId
  //   );
  // }

  // @Cacheable()
  // getSectionLayoutsListWithOnlySections(layoutId: string, clientId: string) {
  //   return this.http.get<any>(
  //     environment.API +
  //       "/Shift/layout/listWithSection/" +
  //       layoutId +
  //       "/" +
  //       clientId
  //   );
  // }

  // // get logged in user details
  // getClientID() {
  //   let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  //   return sessionStorage.clientID
  //     ? sessionStorage.clientID
  //     : currentUser.role != "JtechAdmin" ? currentUser.clientID : null;
  // }

  // resetShifts(layoutId: string, clientId: string) {
  //   return this.http.post<any>(
  //     environment.API + "/DailySetup/layout/resetshifts",
  //     {
  //       layoutID: layoutId,
  //       clientID: clientId
  //     }
  //   );
  // }

  // resetTables(layoutId: string, clientId: string) {
  //   return this.http.post<any>(
  //     environment.API + "/DailySetup/layout/resetalltable",
  //     {
  //       clientID: clientId
  //     }
  //   );
  // }

  // current floor plan
  storeCurrentFloorPlan(floor: any) {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.role == "JtechAdmin") {
      this.session.storeFloorPlanID(floor);
    } else {
      localStorage.setItem("currentFloorPlan", JSON.stringify(floor));
    }
  }

  getCurrentFloorPlan() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.role == "JtechAdmin") {
      let plan = sessionStorage.plan ? JSON.parse(sessionStorage.plan) : null;
      return plan;
    } else {
      return JSON.parse(localStorage.getItem("currentFloorPlan"));
    }
  }

  // current shift layout ID
  storeShiftLayoutID(layoutId: string) {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.role == "JtechAdmin") {
      this.session.storeShiftLayoutID(layoutId);
    } else {
      localStorage.setItem("currentShiftLayoutID", JSON.stringify(layoutId));
    }
  }

  getShiftLayoutID() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.role == "JtechAdmin") {
      return sessionStorage.shiftLayoutID;
    } else {
      return JSON.parse(localStorage.getItem("currentShiftLayoutID"));
    }
  }

  // store panel status
  storePanelPinStatus(panel: string) {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.role == "JtechAdmin") {
      this.session.storePanelPinStatus(panel);
    } else {
      localStorage.setItem("panelPinned", panel);
    }
  }

  getPanelPinStatus() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.role == "JtechAdmin") {
      return sessionStorage.panelPinned;
    } else {
      return localStorage.getItem("panelPinned");
    }
  }

  // store module status
  storeModuleStatus(modules: ModuleStatus) {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.role == "JtechAdmin") {
      this.session.storeModuleStatus(modules);
    } else {
      localStorage.setItem("moduleStatus", JSON.stringify(modules));
    }
  }

  getModuleStatus() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.role == "JtechAdmin") {
      let modules = sessionStorage.modules
        ? JSON.parse(sessionStorage.modules)
        : new ModuleStatus();
      return modules;
    } else {
      let modules = JSON.parse(localStorage.getItem("moduleStatus"));
      return modules ? modules : new ModuleStatus();
    }
  }

  clearSessions() {
    sessionStorage.clear();
    localStorage.removeItem("currentShiftLayoutID");
    localStorage.removeItem("currentFloorPlan");
  }

  // seatReservationParty(model: any) {
  //   return this.http.post<any>(
  //     environment.API + "/Reservation/seatParty",
  //     model
  //   );
  // }

  // seatWaitListParty(model: any) {
  //   return this.http.post<any>(
  //     environment.API + "/WaitListData/seatParty",
  //     model
  //   );
  // }

  // //suggest table
  // sugestTable(model: any) {
  //   return this.http.post<any>(
  //     environment.API + "/WaitListData/suggestTable",
  //     model
  //   );
  // }

  // moveSeatedParty(model: any) {
  //   return this.http.post<any>(
  //     environment.API + "/Floor/table/moveparty",
  //     model
  //   );
  // }

  // saveUserPreference(model: any) {
  //   return this.http.post<any>(
  //     environment.API + "/Settings/Preferences",
  //     model
  //   );
  // }

  // badger(model) {
  //   return this.http.post<any>(environment.API + "/badger/counts", model);
  // }

  // getActiveNoteReminders(clientId: string) {
  //   return this.http.get<any>(
  //     environment.API + "/Notes/getActiveNoteReminders/" + clientId
  //   );
  // }

  // updateNotesStatus(noteId) {
  //   return this.http.get<any>(
  //     environment.API + "/Notes/updateStatus/" + noteId
  //   );
  // }

  // showSideBar(header: boolean) {
  //   this.showSidebar.next(header);
  // }
  // updateBadger(update: boolean) {
  //   this.updateBadgerCount.next(update);
  // }
  // getTableDetails(tableID:string,clientID:string){
  //   return this.http.get<any>(
  //     environment.API + "/Floor/table/" + tableID +"/"+ clientID
  //   );
  // }
}
