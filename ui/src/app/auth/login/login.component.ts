import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { login } from "src/app/store/actions/auth.actions";
import { FormBuilder } from "@angular/forms";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  form;

  constructor(private store: Store<any>, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: ""
    });
  }

  processLogin({ username }) {
    this.store.dispatch(login({ username }));
  }
}
