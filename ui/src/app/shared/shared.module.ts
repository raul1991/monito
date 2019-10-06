import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TopBarComponent } from "./top-bar/top-bar.component";
import { FooterComponent } from "./footer/footer.component";

@NgModule({
  declarations: [TopBarComponent, FooterComponent],
  imports: [CommonModule],
  exports: [TopBarComponent, FooterComponent]
})
export class SharedModule {}
