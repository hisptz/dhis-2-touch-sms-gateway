export const DATABASE_STRUCTURE = {
  LOCAL_INSTANCE_KEY: {
    columns: [
      { value: 'id', type: 'TEXT' },
      { value: 'name', type: 'TEXT' },
      { value: 'currentLanguage', type: 'TEXT' },
      { value: 'currentUser', type: 'LONGTEXT' }
    ],
    isMetadata: false,
    resourceType: '',
    batchSize: 500,
    displayName: 'Local instance',
    dependentTable: []
  },
  smsCommand: {
    columns: [
      { value: 'id', type: 'TEXT' },
      { value: 'commandName', type: 'TEXT' },
      { value: 'parserType', type: 'TEXT' },
      { value: 'separator', type: 'TEXT' },
      { value: 'smsCode', type: 'LONGTEXT' }
    ],
    isMetadata: true,
    resourceType: '',
    batchSize: 30,
    displayName: 'SMS Command',
    dependentTable: []
  },
  dataSets: {
    columns: [
      { value: 'id', type: 'TEXT' },
      { value: 'name', type: 'TEXT' },
      { value: 'dataSetElements', type: 'LONGTEXT' },
      { value: 'dataElements', type: 'LONGTEXT' }
    ],
    fields: '',
    isMetadata: true,
    resourceType: '',
    batchSize: 20,
    displayName: 'Data Sets',
    dependentTable: []
  },
  smsLogs: {
    columns: [
      { value: 'id', type: 'TEXT' },
      { value: '_id', type: 'TEXT' },
      { value: 'time', type: 'TEXT' },
      { value: 'type', type: 'TEXT' },
      { value: 'dataSetId', type: 'TEXT' },
      { value: 'periodIso', type: 'TEXT' },
      { value: 'organisationUnitName', type: 'TEXT' },
      { value: 'organisationUnitId', type: 'TEXT' },
      { value: 'logMessage', type: 'LONGTEXT' },
      { value: 'message', type: 'LONGTEXT' }
    ],
    fields: '',
    isMetadata: true,
    resourceType: '',
    batchSize: 100,
    displayName: 'Data Sets',
    dependentTable: []
  }
};
