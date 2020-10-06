import { Injectable } from "@angular/core";
import { of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  constructor() {}
  // TODO: Process login on API once its ready
  login({ username }) {
    if (username) {
      return of(true);
    }

    return of(false);
  }

  logout() {
    return of(true);
  }
}
