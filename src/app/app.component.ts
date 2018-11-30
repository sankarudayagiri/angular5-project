import { Component } from "@angular/core";
import { Router, NavigationStart, NavigationEnd, Event } from "@angular/router";
import { AuthenticationService } from "./authentication/authentication.service";
import { User } from "./_models";
import { plainToClass } from "class-transformer";
import { Subscription } from "rxjs";
import { InitializeService } from "./_services";

@Component({
  selector: "app-root",
  template: `<mat-progress-bar *ngIf="routerLoader" class="router-loader" mode="indeterminate"></mat-progress-bar>
  <router-outlet></router-outlet>`
})
export class AppComponent {
  public routerLoader: boolean = false;
  public currentUser: User;
  private routerSubscription: Subscription;

  constructor(
    private router: Router,
    private authenticate: AuthenticationService,
    private initialize: InitializeService
  ) {
    this.currentUser = this.authenticate.getUser();
    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      this.loadingBarInterceptor(event);
    });
  }

  // CLEANUP
  private loadingBarInterceptor(event: Event) {
    if (event instanceof NavigationStart) {
      this.routerLoader = true;
      this.autoLoginFromApp(event);
    }

    if (event instanceof NavigationEnd) {
      this.currentUser = this.authenticate.getUser();
      event.url == "/" && this.redirect();
      setTimeout(() => {
        this.routerLoader = false;
      }, 1000);
      window.scrollTo(0, 0);
    }
  }

  private autoLoginFromApp(event) {
    let uri = event.url,
      lastslashindex = uri.lastIndexOf("/"),
      result = uri.substring(lastslashindex + 1);
    if (result.length > 100) {
      let tokenInfo = this.authenticate.getDecodedAccessToken(result);
      if (tokenInfo) tokenInfo.token = result;
      if (tokenInfo && tokenInfo.token) {
        let user = plainToClass(User, tokenInfo);
        this.authenticate.storeCurrentuser(user); // store token to send back
      }
    }
  }

  private redirect() {
    if (this.currentUser) {
      let redirectUrl =
        this.currentUser.role == "JtechAdmin"
          ? "/jtech-admin/search"
          : this.currentUser.role == "ClientAdmin"
            ? "/admin/settings"
            : this.getHostRedirectUrl();
      this.router.navigate([redirectUrl]);
    } else {
      this.router.navigate(["/login"]);
    }
  }

  private getHostRedirectUrl() {
    let modules = this.initialize.returnModuleStatus();
    if (modules.hasModuleTable && modules.hasModuleStaff) {
      return "/dashboard";
    } else if (modules.hasModuleWaitList) {
      return "/waitlist";
    } else if (modules.hasModuleReservations) {
      return "/reservation";
    }
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }
}
