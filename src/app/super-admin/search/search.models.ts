export class ClientLocation {
  code: string;
  dba: string;
  //currentDateTime: Date = new Date();
  CurrentDateTimeOffset: string;
}

export class ClientSearch {
  searchText: string;
  accountStatus: number;
}

export class AccountCount {
  activeCount: number = 0;
  total: number = 0;
  trialCount: number = 0;
  onHoldCount: number = 0;
  pendingTrainingCount: number = 0;
  cancelledCount: number = 0;
}
