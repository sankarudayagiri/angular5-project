import { Component } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import "rxjs/add/operator/filter";
import * as _ from "underscore";

@Component({
  selector: "app-breadcrumbs",
  template: `
  <ng-template ngFor let-breadcrumb [ngForOf]="breadcrumbs" let-last = "last">
    <li class="breadcrumb-item"
        *ngIf="breadcrumb.label.title&&breadcrumb.url.substring(breadcrumb.url.length-1) == '/'||breadcrumb.label.title&&last&&!hideAdmin"
        [ngClass]="{active: last}">
      <a class="pr-1 text-uppercase" *ngIf="!last && !hideAdmin" [routerLink]="breadcrumb.url">{{breadcrumb.label.title}}</a>
      <span class="text-uppercase" *ngIf="last && !hideAdmin" [routerLink]="breadcrumb.url">{{breadcrumb.label.title}}</span>
    </li>
<span class="text-muted text-uppercase" *ngIf="last && hideAdmin" [routerLink]="breadcrumb.url">Settings</span>

  </ng-template>`
})
export class BreadcrumbsComponent {
  breadcrumbs: Array<Object>;
  hideAdmin: boolean = true;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.updateBreadcrumbs();
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe(event => {
        this.updateBreadcrumbs();
      });
  }

  updateBreadcrumbs() {
    var self = this;
    this.breadcrumbs = [];
    let currentRoute = this.route.root,
      url = "";
    do {
      const childrenRoutes = currentRoute.children;
      currentRoute = null;

      childrenRoutes.forEach(route => {
        if (route.outlet === "primary") {
          const routeSnapshot = route.snapshot;
          url += `/${routeSnapshot.url.map(segment => segment.path).join("/")}`;
          this.breadcrumbs.push({
            label: route.snapshot.data,
            url: url
          });
          _.each(this.breadcrumbs,
            function(i) {
              if (i.url == "//admin//settings") {
                self.hideAdmin = true;
              } else {
                self.hideAdmin = false;
              }
            });
          currentRoute = route;
        }
      });
    } while (currentRoute);
  }
}
