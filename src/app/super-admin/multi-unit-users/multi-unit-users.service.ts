import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../../environments/environment";

export class clientData {
  multiUnitClientID: string;
  clientIDs: any[]=[]
}
export class multiClientData{
  multiUnitClientID:string=null;
  clients:clientUnderMultiAdmin[]=[];
  userName:string=null;
  searchData:string=null
}
export class clientUnderMultiAdmin{
  dba:string=null;
  id:string=null;
}
@Injectable()
export class MultiUnitUserService {
  constructor(private http: HttpClient) { }
    getMultiUnitUsersLists() {
    return this.http
      .get<any>(environment.API + "/multiunitclients/getAllMultiUnitClients")
      
  }
  getClients(clientID) {
    return this.http
      .get<any>(environment.API + "/multiunitclients/addclients" + clientID)
     
  }
  addClients(model) {
    return this.http
      .post<any>(environment.API + "/multiunitclients/addclients",model)
      
  }
  getAllMultiUnitUsers() {
    return this.http
      .get<any>(environment.API + "/user/admin/listmultiunitadminusers")
  }
}
