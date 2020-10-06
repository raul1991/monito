import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { isLoggedIn } from "./store/reducers/auth.reducer";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "Monito.";
  isLoggedIn;

  constructor(private store: Store<any>, private router: Router) {}

  ngOnInit() {
    this.store.select(isLoggedIn).subscribe(state => {
      this.isLoggedIn = state;
      console.log("this", this.isLoggedIn);

      if (this.isLoggedIn) {
        this.router.navigate(["dashboard"]);
      }

      if (!this.isLoggedIn) {
        this.router.navigate(["auth"]);
      }
    });
  }
}
