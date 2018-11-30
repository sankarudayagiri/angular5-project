import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../../environments/environment";

export class JtechAdmin {
  id: string = null;
}

@Injectable()
export class JtechUsersService {
  constructor(private http: HttpClient) {}

  getJetchAdminLists() {
    return this.http.get<any>(
      environment.API + "/user/admin/listjtechadminusers"
    );
  }
}
