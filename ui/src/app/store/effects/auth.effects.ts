import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, mergeMap } from "rxjs/operators";
import {
  loginDone,
  loginType,
  logOutType,
  logOutDone
} from "../actions/auth.actions";
import { AuthService } from "src/app/services/auth.service";

@Injectable()
export class AuthEffects {
  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loginType),
      mergeMap(({ username }) => {
        return this.authService.login({ username }).pipe(
          map(response => {
            return loginDone({ username, loggedIn: response });
          })
        );
      })
    );
  });

  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(logOutType),
      map(action => {
        console.log("action", action);
        return action;
      }),
      mergeMap(action => {
        console.log("actionsac", action);
        return this.authService.logout().pipe(
          map(response => {
            return logOutDone();
          })
        );
      })
    );
  });

  constructor(private actions$: Actions, private authService: AuthService) {}
}
