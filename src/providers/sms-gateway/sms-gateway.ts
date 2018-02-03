import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Observable } from "rxjs/Observable";
import { SmsConfiguration } from "../../models/smsCommand";

declare var SMS: any;

/*
  Generated class for the SmsGatewayProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SmsGatewayProvider {
  constructor(private storage: Storage) {}

  /**
   *
   * @param currentUser
   * @returns {Observable<SmsConfiguration>}
   */
  getSmsConfigurations(currentUser): Observable<SmsConfiguration> {
    return new Observable(observer => {
      let key = "sms-configuration-" + currentUser.currentDatabase;
      this.storage
        .get(key)
        .then((configuration: any) => {
          configuration = JSON.parse(configuration);
          if (!configuration) {
            configuration = this.getDefaultConfigurations();
          }
          observer.next(configuration);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   *
   * @param currentUser
   * @param configuration
   * @returns {Observable<any>}
   */
  setSmsConfigurations(currentUser, configuration: any): Observable<any> {
    return new Observable(observer => {
      let key = "sms-configuration-" + currentUser.currentDatabase;
      configuration = JSON.stringify(configuration);
      this.storage
        .set(key, configuration)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   *
   * @returns {SmsConfiguration}
   */
  getDefaultConfigurations(): SmsConfiguration {
    let defaultConfigurations: SmsConfiguration = {
      dataSetIds: [],
      isStarted: false
    };
    return defaultConfigurations;
  }

  startWatchingSms() {
    if (SMS)
      SMS.startWatch(
        () => {
          console.log("watching started");
        },
        Error => {
          console.log("failed to start watching : " + JSON.stringify(Error));
        }
      );

    document.addEventListener("onSMSArrive", (e: any) => {
      let sms = e.data;
      console.log(JSON.stringify(e));
      console.log(sms);
    });
  }

  stopWatchingSms() {
    if (SMS)
      SMS.stopWatch(
        () => {
          console.log("stop started");
        },
        Error => {
          console.log("failed to start watching" + JSON.stringify(Error));
        }
      );
  }
}
