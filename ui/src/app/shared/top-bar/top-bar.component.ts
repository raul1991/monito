import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { isLoggedIn } from "src/app/store/reducers/auth.reducer";
import { logOut } from "src/app/store/actions/auth.actions";

@Component({
  selector: "app-top-bar",
  templateUrl: "./top-bar.component.html",
  styleUrls: ["./top-bar.component.scss"]
})
export class TopBarComponent implements OnInit {
  isLoggedIn;
  author: "example@example.com";

  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.store.select(isLoggedIn).subscribe(state => {
      this.isLoggedIn = state;
    });
  }

  logout() {
    console.log("logout clicked");
    this.store.dispatch(logOut());
  }
}
