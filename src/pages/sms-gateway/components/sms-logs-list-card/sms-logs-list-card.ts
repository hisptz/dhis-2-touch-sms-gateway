import { Component, Input } from '@angular/core';
import { SmsGateWayLogs } from '../../../../models/smsCommand';

/**
 * Generated class for the SmsLogsListCardComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'sms-logs-list-card',
  templateUrl: 'sms-logs-list-card.html'
})
export class SmsLogsListCardComponent {
  @Input() smsLog: SmsGateWayLogs;
  icons: any;
  constructor() {
    this.icons = {
      danger: 'assests/icon/danger.png',
      info: 'assests/icon/info.png',
      warning: 'assests/icon/warning.png'
    };
  }
}
