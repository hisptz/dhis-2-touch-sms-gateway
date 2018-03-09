import { Component, Input, OnInit } from '@angular/core';
import { SmsGateWayLogs } from '../../../../models/smsCommand';
import { AppTranslationProvider } from '../../../../providers/app-translation/app-translation';

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
export class SmsLogsListCardComponent implements OnInit {
  @Input() smsLog: SmsGateWayLogs;
  icons: any;
  isSelected: boolean;
  translationMapper: any;
  constructor(private appTranslation: AppTranslationProvider) {
    this.icons = {
      danger: 'assets/icon/danger.png',
      info: 'assets/icon/info.png',
      warning: 'assets/icon/warning.png'
    };
    this.isSelected = false;
  }

  ngOnInit() {
    this.translationMapper = {};
    this.appTranslation.getTransalations(this.getValuesToTranslate()).subscribe(
      (data: any) => {
        this.translationMapper = data;
      },
      error => {}
    );
  }

  toggleLogsDetails() {
    this.isSelected = !this.isSelected;
  }

  getValuesToTranslate() {
    return ['Sender', 'SMS Content'];
  }
}
