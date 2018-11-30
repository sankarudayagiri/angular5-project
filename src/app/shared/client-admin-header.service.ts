import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Subject } from "rxjs/Subject";
import { Client } from "../_models/client";

@Injectable()
export class ClientAdminHeaderService {
  private clientData = new Subject<any>();

  sendclientData(clientData: Client) {
    this.clientData.next(clientData);
  }
  getclientData(): Observable<Client> {
    return this.clientData.asObservable();
  }
}
