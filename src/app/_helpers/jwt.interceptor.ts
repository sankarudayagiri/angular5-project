import { Injectable } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpHeaderResponse
} from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/takeUntil";
import "rxjs/add/observable/throw";
import "rxjs/add/operator/do";
import { User } from "../_models";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  returnUrl: string;
  constructor(private route: ActivatedRoute, private router: Router) {
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/admin";
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any> | HttpHeaderResponse> {
    // add authorization header with jwt token if available
    let currentUser: User = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
    }

    return next.handle(request).catch((error: any) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          this.handle401Error();
        } else if (error.status === 403) {
          this.handle403Error();
        }
      }
      return Observable.throw(error);
    });
  }

  handle401Error() {
    this.router.navigate(["/login"], {
      queryParams: { returnUrl: this.returnUrl }
    });
    return false;
  }

  handle403Error() {
    this.router.navigate(["/unauthorised"]);
    return false;
  }
}
