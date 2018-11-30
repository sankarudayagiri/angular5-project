import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Subject } from "rxjs/Subject";

export class Occupancy {
  totalParties: number;
  totalCovers: number;
  totalTables: number;
  activeFloorPlans: number;
  percentage: number;
}

@Injectable()
export class AdminHeaderService {
  private showHeaderSource = new Subject<boolean>();
  showAdminHeader$ = this.showHeaderSource.asObservable();

  showAdminHeader(header: boolean) {
    this.showHeaderSource.next(header);
  }
}
