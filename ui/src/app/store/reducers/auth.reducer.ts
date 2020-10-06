import { createReducer, on } from "@ngrx/store";
import {
  login,
  loginDone,
  loginFailed,
  logOutDone
} from "../actions/auth.actions";

export const initialState = {
  loggedIn: false,
  user: {}
};

const _authReducer = createReducer(
  initialState,
  // Login
  on(login, (state, action) => {
    return state;
  }),
  on(loginDone, (state, action) => {
    const { loggedIn, username } = <any>action;

    return {
      ...state,
      loggedIn,
      user: {
        username
      }
    };
  }),
  on(loginFailed, state => {
    return state;
  }),
  on(logOutDone, state => {
    return {
      ...state,
      loggedIn: false,
      user: {}
    };
  })
);

export function authReducer(state, action) {
  return _authReducer(state, action);
}

export const isLoggedIn = store => {
  return store.auth.loggedIn;
};
