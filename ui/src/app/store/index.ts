import { ActionReducerMap, MetaReducer, combineReducers } from "@ngrx/store";
import { environment } from "../../environments/environment";
import { authReducer } from "./reducers/auth.reducer";

export interface State {}

export const reducers: ActionReducerMap<State> = {
  auth: authReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? []
  : [];
