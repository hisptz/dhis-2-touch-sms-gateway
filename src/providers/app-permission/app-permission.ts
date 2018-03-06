import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions';

/*
  Generated class for the AppPermissionProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AppPermissionProvider {
  constructor(private androidPermissions: AndroidPermissions) {}
}
