import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { environment } from "../../environments/environment";


@Injectable()
export class AvailableTableService {
    constructor(private http: HttpClient) { }

    // getAvailableTables(layoutid : string, clientid :string) {
    //     return this.http
    //         .get<any>(environment.API + "/dashboard/availabletables/" + layoutid + "/" + clientid);
    // }

    // getAvailableTablesNoShift(layoutid : string,clientid : string) {
    //     return this.http
    //         .get<any>(environment.API + "/dashboard/availabletablesNoShift/" + layoutid + "/" + clientid);
    // }    
}
