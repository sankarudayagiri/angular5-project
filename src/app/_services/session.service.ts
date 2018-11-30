import { Injectable } from "@angular/core";

@Injectable()
export class SessionService {

  storeSessionClientID(clientid: string) {
    if (typeof Storage !== "undefined") {
        sessionStorage.clientID = clientid;
    }
  }

  storeFloorPlanID(plan: any) {
    if (typeof Storage !== "undefined") {
      sessionStorage.plan = JSON.stringify(plan);
    }
  }

  storePanelPinStatus(panel: string) {
    if (typeof Storage !== "undefined") {
      sessionStorage.panelPinned = panel;
    }
  }

  storeShiftLayoutID(layoutId: string) {
    if (typeof Storage !== "undefined") {
        sessionStorage.shiftLayoutID = layoutId;
    }
  }

  storeClientTimeZone(timzone: string) {
    if (typeof Storage !== "undefined") {
      sessionStorage.timeZone = timzone;
    }
  }

  storeModuleStatus(modules: any) {
    if (typeof Storage !== "undefined") {
      sessionStorage.modules = JSON.stringify(modules);
    }
  }
}
