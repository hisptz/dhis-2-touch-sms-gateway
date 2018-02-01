///<reference path="../providers/user/user.ts"/>
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpModule, Http } from '@angular/http';

//native plugins
import {SQLite} from "@ionic-native/sqlite";
import {HTTP} from "@ionic-native/http";
import {AppVersion} from "@ionic-native/app-version";
import {Network} from "@ionic-native/network";
import {BackgroundMode} from "@ionic-native/background-mode";
import {IonicStorageModule} from "@ionic/storage";
import {SMS} from "@ionic-native/sms";

//translations
export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

//store
import {reducers} from "../store/reducers/index";
import {StoreModule} from "@ngrx/store";


import { MyApp } from './app.component';
import {LauncherPage} from "../pages/launcher/launcher";
import {SharedModule} from "../components/share.module";
import { NetworkAvailabilityProvider } from '../providers/network-availability/network-availability';
import {UserProvider} from "../providers/user/user";
import {SmsCommandProvider} from "../providers/sms-command/sms-command";
import {SqlLiteProvider} from "../providers/sql-lite/sql-lite";
import {AppProvider} from "../providers/app/app";
import {LocalInstanceProvider} from "../providers/local-instance/local-instance";
import {HttpClientProvider} from "../providers/http-client/http-client";
import {AppTranslationProvider} from "../providers/app-translation/app-translation";
import {EncryptionProvider} from "../providers/encryption/encryption";
import {SettingsProvider} from "../providers/settings/settings";
import { DataSetsProvider } from '../providers/data-sets/data-sets';
import { SmsGatewayProvider } from '../providers/sms-gateway/sms-gateway';



@NgModule({
  declarations: [
    MyApp,
    LauncherPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    StoreModule.forRoot(reducers),
    IonicStorageModule.forRoot(),
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    }),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LauncherPage
  ],
  providers: [
    StatusBar,SQLite,SMS,
    SplashScreen,HTTP,AppVersion,Network,BackgroundMode,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NetworkAvailabilityProvider,UserProvider,
    SettingsProvider,
    SqlLiteProvider,SmsCommandProvider,AppProvider,EncryptionProvider,
    LocalInstanceProvider,HttpClientProvider,AppTranslationProvider,
    DataSetsProvider,
    SmsGatewayProvider

  ]
})
export class AppModule {}
