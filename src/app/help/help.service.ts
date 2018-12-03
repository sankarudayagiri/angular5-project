import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class HelpService {
  constructor(private http: HttpClient) {}
  // getFiles() {
  //   return this.http.get<any>(
  //     "http://jtechbutterflyapiofflinedev.azurewebsites.net/help/filelist"
  //   );
  // }
}
