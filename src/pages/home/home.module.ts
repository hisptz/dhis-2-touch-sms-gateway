import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import {SharedModule} from "../../components/share.module";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    HomePage,
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
    SharedModule,
    TranslateModule.forChild({})
  ],
})
export class HomePageModule {}
