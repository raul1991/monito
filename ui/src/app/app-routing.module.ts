import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AuthGuard } from "./auth/auth.guard";
import { AboutComponent } from "./about/about.component";

const routes: Routes = [
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "about",
    component: AboutComponent
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then(m => m.AuthModule)
  },
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "**", component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
