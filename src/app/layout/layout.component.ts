import { Component, OnInit } from "@angular/core";
import { LoaderService } from "../_services/loader.service";
import { NotificationService } from "../notification/notification.service";
import { NotesService } from "../notes/notes.service";
import { InitializeService } from "../_services/initialize.service";
import { SharedDataService } from "../_services";
import { Router, NavigationEnd, Event } from "@angular/router";
import { Subscription } from "rxjs";
import { User } from "../_models";
import { AuthenticationService } from "../authentication/authentication.service";

@Component({
  selector: "app-base-layout",
  template: `<app-header *ngIf="appInitialized" [location]="true"></app-header>
  <div class="app-body">
  <app-sidebar *ngIf="appInitialized" [ngClass]="{'d-none' : appInitializedStart}"> </app-sidebar>
  
  <app-notification *ngIf="appInitialized" [openPanel]="this.NotificationService.openNotificationPanel"></app-notification>
  <app-notes *ngIf="appInitialized" [openPanel]="this.NotesService.openNotesPanel"></app-notes> 
 
    <main class="main">
      <div class="loader-overlay" *ngIf="showLoading || !appInitialized || appInitializedStart">
        <widget-loader [text]="appInitializedStart ? loadingText : ''"></widget-loader>
      </div>
      <div class="container-fluid p-0" *ngIf="appInitialized" [ngClass]="{'d-none' : !appInitialized || appInitializedStart}">
        <router-outlet></router-outlet>
      </div>
    </main>
  </div>
  <!--<app-footer></app-footer> -->`,
  styleUrls: ["./layout.component.scss"],
  providers: [LoaderService]
})
export class LayoutComponent implements OnInit {
  showLoading: boolean = false;
  currentUser: User;
  appInitialized: boolean = false;
  appInitializedStart: boolean;
  loadingText: string = "Setting up your account";

  private initializeRouterSubscription: Subscription;

  constructor(
    private router: Router,
    public loaderService: LoaderService,
    public NotificationService: NotificationService,
    private initialize: InitializeService,
    private shared: SharedDataService,
    public NotesService: NotesService,
    private authenticate: AuthenticationService
  ) {
    this.initializeRouterSubscription = this.router.events.subscribe(
      (event: Event) => {
        this.checkRedirection(event);
      }
    );

    this.currentUser = this.authenticate.getUser();
    this.loadingText =
      this.currentUser.role == "JtechAdmin"
        ? "Setting up account"
        : "Setting up your account";

    loaderService.showLoader$.subscribe(loader => {
      setTimeout(() => {
        this.showLoading = loader;
      });
    });

    initialize.notifyInitializeStart$.subscribe(() => {
      this.appInitializedStart = true;
    });

    initialize.notifyInitialize$.subscribe(() => {
      setTimeout(() => {
        this.appInitialized = true;
        this.appInitializedStart = false;
      }, 500);
    });
  }

  //CLEANUP
  private checkRedirection(event: Event) {
    let user = this.currentUser,
      clientId = this.shared.getClientID();
    if (event instanceof NavigationEnd) {
      if (user) {
        this.initialize.initializeLocation(clientId, user.userID, user.role);
      } else {
        this.router.navigate(["/login"]);
      }
    }
  }

  ngOnInit() {
    this.initializeRouterSubscription.unsubscribe();
  }
}
