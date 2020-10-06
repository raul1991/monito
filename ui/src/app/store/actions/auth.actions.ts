import { createAction } from "@ngrx/store";

export const loginType = "[Auth] Login";
export const login = createAction(loginType, {
  _as: "props",
  _p: {}
});

export const loginDoneType = "[Auth] Login Done";
export const loginDone = createAction(loginDoneType, {
  _as: "props",
  _p: {}
});

export const loginFailed = createAction("[Auth] Login Failed");

export const logOutType = "[Auth] Login Logout";
export const logOut = createAction(logOutType);

export const logOutTypeDone = "[Auth] Login Logout Done";
export const logOutDone = createAction(logOutTypeDone);
