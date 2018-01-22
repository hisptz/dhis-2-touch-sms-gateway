
export interface CurrentUser {
  username : string;
  password : string; //encrypted string
  serverUrl :  string;
  currentLanguage : string;
  authorizationKey? : string;
  currentDatabase? : string;
  dhisVersion? : string;
  authorities?: Array<string>;
  progressTracker? : any;
}
