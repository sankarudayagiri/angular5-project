import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../../environments/environment";

export class UserDetailModel {
  id: string;
  userName: string;
  password: string;
  email: string;
  clientID: string = null;
  isHost: boolean = false;
  isClientAdmin: boolean = false;
  isJTechAdmin: boolean = false;
  isMultiUnitAdmin: boolean = false;
  salt: string;
  userID:string;
}

@Injectable()
export class UsersService {
  constructor(private http: HttpClient) {}

  getAllUsers(clientid: string) {
    return this.http.get<any>(
      environment.API + "/user/admin/listallusers/" + clientid
    );
  }

  createUser(model) {
    return this.http.post<any>(environment.API + "/user/admin/create", model);
  }
  deleteUser(userid: string) {
    return this.http.delete<any>(
      environment.API + "/user/admin/delete/" + userid
    );
  }
  
  editUsers(model) {
    return this.http.post<any>(environment.API + "/user/admin/edit", model);
  }
}
