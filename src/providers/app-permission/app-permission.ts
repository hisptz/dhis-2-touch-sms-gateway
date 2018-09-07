import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { AndroidPermissions } from '@ionic-native/android-permissions';

/*
  Generated class for the AppPermissionProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AppPermissionProvider {
  constructor(private androidPermissions: AndroidPermissions) {}

  getSMSPermisionStatus(): Observable<any> {
    return new Observable(observer => {
      this.androidPermissions
        .checkPermission(this.androidPermissions.PERMISSION.READ_SMS)
        .then(
          result => {
            observer.next(result.hasPermission);
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  requestSMSPermission(): Observable<any> {
    return new Observable(observer => {
      this.androidPermissions
        .requestPermission(this.androidPermissions.PERMISSION.READ_SMS)
        .then((response: any) => {
          observer.next(response.hasPermission);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}
