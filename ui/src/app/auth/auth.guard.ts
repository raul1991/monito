import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from "@angular/router";
import { Store } from "@ngrx/store";
import { isLoggedIn } from "../store/reducers/auth.reducer";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private store: Store<any>, private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.store.select(isLoggedIn).pipe(
      map(isLoggedIn => {
        if (!isLoggedIn) {
          this.router.navigate(["/auth/login"]);
          return false;
        }
        return true;
      })
    );
  }
}
