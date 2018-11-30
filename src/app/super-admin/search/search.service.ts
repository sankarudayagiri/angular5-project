import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../../environments/environment";
import { Cacheable, CacheBuster } from "ngx-cacheable";
import { Subject } from "rxjs";

const cacheBuster$ = new Subject<void>();

@Injectable()
export class JtechAdminService {
  constructor(private http: HttpClient) {}

  postClientSearch(model) {
    return this.http.post<any>(environment.API + "/client/admin/search", model);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  createLocation(model) {
    return this.http.post<any>(
      environment.API + "/client/admin/location/create",
      model
    );
  }

  @Cacheable({
    cacheBusterObserver: cacheBuster$
  })
  clientCount(count: number) {
    return this.http.get<any>(
      environment.API + "/client/admin/clientdata/" + count
    );
  }
}
