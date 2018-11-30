import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../../environments/environment";

export class BlastData {
  id: string;
  clientID: string;
  textMessage: string = null;
  whenBlast: number = 1;
  whenDatetime: Date = new Date();
  who: number = 1;
  whoByName: string = null;
  whoByLottery: string = null;
  createdDate: Date = new Date();
  takeLastHour: string;
}

@Injectable()
export class BlastService {
  constructor(private http: HttpClient) {}

  createBlast(model) {
    return this.http.post<any>(
      environment.API + "/textmessage/admin/createBlast",
      model
    );
  }
}
