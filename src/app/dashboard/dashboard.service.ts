import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
//import { environment } from "../../environments/environment";
import { Cacheable } from "ngx-cacheable";

export class Occupancy {
  totalParties: number = 0;
  totalCovers: number = 0;
  totalTables: number = 0;
  activeFloorPlans: number = 0;
  percentage: number = 0;
  fromDate: Date;
  toDate: Date;
}

export class ReservationCount {
  fromDate: string;
  toDate: string;
  clientID: string;
}

export class ReservationData {
  intervalMinutes: number = 15;
  fromDate: string;
  toDate: string;
  dateToGetAvailableReservations: string;
  clientID: string;
}

@Injectable()
export class DashBoardService {
  constructor(private http: HttpClient) { }

  // totalReservationCount(model) {
  //   return this.http.post<any>(
  //     environment.API + "/dashboard/totalReservationCount",
  //     model
  //   );
  // }

  // reservation(model) {
  //   return this.http.post<any>(
  //     environment.API + "/dashboard/reservation",
  //     model
  //   );
  // }
}
