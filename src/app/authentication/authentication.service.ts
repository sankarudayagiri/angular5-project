import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import * as jwt_decode from "jwt-decode";
import { environment } from "../../environments/environment";
import { User } from "../_models";
import { plainToClass } from "class-transformer";

@Injectable()
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http
      .post<any>(environment.API + "/account/login", {
        username: username,
        password: password
      })
      .map(user => {
        if (user.token) {
          let tokenInfo = this.getDecodedAccessToken(user.token);
          tokenInfo.token = user.token;
          if (tokenInfo && tokenInfo.token) {
            let user = plainToClass(User, tokenInfo);
            this.storeCurrentuser(user); // store token to send back
            return user;
          }
        } else {
          return user;
        }
      });
  }

  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }

  storeCurrentuser(tokenInfo) {
    localStorage.setItem("currentUser", JSON.stringify(tokenInfo));
    sessionStorage.clear();
  }

  getUser() {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    return user ? user : null;
  }

  logout(UserName: string) {
    return this.http.post<any>(environment.API + "/account/logout", {
      username: UserName
    });
  }

  resetPassword(modal) {
    return this.http.post<any>(
      environment.API + "/account/passwordReset",
      modal
    );
  }
}
