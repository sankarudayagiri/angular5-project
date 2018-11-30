import { Component, OnInit } from "@angular/core";
import { LoaderService } from "../_services/loader.service";
import { Router, NavigationEnd, Event } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "jtech-app-base-layout",
  template: `<app-header *ngIf="showJtechHeader"></app-header>
  <div class="app-body">
    <main class="main">
      <div class="container-fluid p-0" [ngClass]="{'jtech-search' : !showJtechHeader}">
        <router-outlet></router-outlet>
      </div>
    </main>
  </div>
  <!--<jtech-footer></jtech-footer> -->`,
  styleUrls: ["./jtech-layout.component.scss"],
  providers: [LoaderService]
})
export class JtechLayoutComponent {
  public showJtechHeader: boolean = true;
  private initializeRouterSubscription: Subscription;

  constructor(private router: Router) {
    this.initializeRouterSubscription = this.router.events.subscribe(
      (event: Event) => {
        this.checkRedirection(event);
      }
    );
  }

  private checkRedirection(event: Event) {
    if (event instanceof NavigationEnd) {
      this.showJtechHeader =
        event.url == "/jtech-admin/search" || event.url == "/jtech-admin"
          ? false
          : true;
    }
  }

  ngOnDestroy() {
    this.initializeRouterSubscription.unsubscribe();
  }
}
