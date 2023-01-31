export interface IComplianceHistoricalReport {
  reportId: string;
  address: string;
  risk: string;
  status: string;
  reportVersion: number;
  createTime: string;
}

export interface ICompliancePaginatedItems<T> {
  items: T[];
  total: number;
  links: Array<{ rel: string; href: string }>;
}

interface ITransfers {
  count: number;
  firstTime: string;
  lastTime: string;
  usd: number;
  riskDistribution: Array<{
    risk: string;
    count: number;
    usd: number;
  }>;
}

interface IFundsFlow {
  name: string;
  risk: string;
  usd: number;
}

interface ITag {
  name: string;
  risk: string;
}

export interface IComplianceActivityReport {
  reportId: string;
  reportVersion: number;
  reportBlockNumber: number;
  reportTime: string;
  address: string;
  isContract: boolean;
  risk: string;
  relatedEntities: Array<any>;
  tags: ITag[];
  fundsFlow: {
    incoming: IFundsFlow[];
    outgoing: IFundsFlow[];
  };
  transfers: ITransfers;
  receivedTransfers: ITransfers;
  sentTransfers: ITransfers;
}

export interface IComplianceReportProgress {
  progressPercent: number;
}

export interface IComplianceReportInProgress {
  address: string;
  reportId: string;
}
