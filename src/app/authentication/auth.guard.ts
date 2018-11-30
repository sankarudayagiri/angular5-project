import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";
import { ModuleStatus, SharedDataService } from "../_services";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (localStorage.getItem("currentUser")) {
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser.token) {
        return true;
      } else {
        this.router.navigate(["/unauthorised"]);
        return false;
      }
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

@Injectable()
export class SuperAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate() {
    if (localStorage.getItem("currentUser")) {
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      let superAdmin = currentUser.role === "JtechAdmin" ? true : false;
      if (superAdmin) {
        return true;
      } else {
        debugger;
        this.router.navigate(["/unauthorised"]);
        return false;
      }
    }
  }
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate() {
    if (localStorage.getItem("currentUser")) {
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));

      let clientAdmin =
        currentUser.role === "ClientAdmin" || currentUser.role === "JtechAdmin"
          ? true
          : false;
      if (clientAdmin) {
        return true;
      } else {
        debugger;
        this.router.navigate(["/unauthorised"]);
        return false;
      }
    }
  }
}

@Injectable()
export class MultiAdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate() {
    if (localStorage.getItem("currentUser")) {
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      let multiUnitAdmin =
        currentUser.role === "MultiUnitAdmin" ||
        currentUser.role === "JtechAdmin"
          ? true
          : false;
      if (multiUnitAdmin) {
        return true;
      } else {
        debugger;
        this.router.navigate(["/unauthorised"]);
        return false;
      }
    }
  }
}

@Injectable()
export class TablesModuleAuthGuard implements CanActivate {
  constructor(private router: Router, private shared: SharedDataService) {}

  canActivate() {
    let modules: ModuleStatus = this.shared.getModuleStatus();
    if (modules.hasModuleTable) {
      return true;
    } else {
      this.router.navigate(["/not-purchased"]);
      return false;
    }
  }
}

@Injectable()
export class StaffModuleAuthGuard implements CanActivate {
  constructor(private router: Router, private shared: SharedDataService) {}

  canActivate() {
    let modules: ModuleStatus = this.shared.getModuleStatus();
    if (modules.hasModuleStaff) {
      return true;
    } else {
      this.router.navigate(["/not-purchased"]);
      return false;
    }
  }
}

@Injectable()
export class WaitListModuleAuthGuard implements CanActivate {
  constructor(private router: Router, private shared: SharedDataService) {}

  canActivate() {
    let modules: ModuleStatus = this.shared.getModuleStatus();
    if (modules.hasModuleWaitList) {
      return true;
    } else {
      this.router.navigate(["/not-purchased"]);
      return false;
    }
  }
}

@Injectable()
export class ReservationModuleAuthGuard implements CanActivate {
  constructor(private router: Router, private shared: SharedDataService) {}

  canActivate() {
    let modules: ModuleStatus = this.shared.getModuleStatus();
    if (modules.hasModuleReservations) {
      return true;
    } else {
      this.router.navigate(["/not-purchased"]);
      return false;
    }
  }
}

@Injectable()
export class FeedbackModuleAuthGuard implements CanActivate {
  constructor(private router: Router, private shared: SharedDataService) {}

  canActivate() {
    let modules: ModuleStatus = this.shared.getModuleStatus();
    if (modules.hasModuleServerRatings) {
      return true;
    } else {
      this.router.navigate(["/not-purchased"]);
      return false;
    }
  }
}

@Injectable()
export class TapAheadModuleAuthGuard implements CanActivate {
  constructor(private router: Router, private shared: SharedDataService) {}

  canActivate() {
    let modules: ModuleStatus = this.shared.getModuleStatus();
    if (modules.hasModuleTapAheadSeating) {
      return true;
    } else {
      this.router.navigate(["/not-purchased"]);
      return false;
    }
  }
}
