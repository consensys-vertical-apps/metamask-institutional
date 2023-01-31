import { EventEmitter } from "events";
import { SimpleCache } from "@metamask-institutional/simplecache";
import { COMPLIANCE_API_URL, COMPLIANCE_POLLING_INTERVAL } from "./constants";
import { ComplianceError } from "./ComplianceError";
import {
  IComplianceActivityReport,
  ICompliancePaginatedItems,
  IComplianceHistoricalReport,
  IComplianceReportProgress,
  IComplianceReportInProgress,
} from "./types";
import { TimerService } from "./TimerService";
import { Auth0 } from "./Auth0";

const COMPLIANCE_CACHE_TIME = 3600 * 10; // 10 hours is the lifetime of the id_token

export class Compliance extends EventEmitter {
  polling = false;
  private projectId: string;
  private timerService: TimerService;
  private auth0Client: Auth0;
  private cache = new SimpleCache();
  private reportsInProgress: Array<IComplianceReportInProgress> = [];

  constructor(projectId: string, auth0: Auth0) {
    super();
    this.projectId = projectId;
    this.auth0Client = auth0;
    this.timerService = new TimerService(this.poll.bind(this), COMPLIANCE_POLLING_INTERVAL);
  }

  setProjectId(projectId: string) {
    this.projectId = projectId;
  }

  startPolling() {
    this.polling = true;
  }

  stopPolling() {
    this.polling = false;
    this.reportsInProgress = [];
  }

  addReportToQueue({ reportId, address }: IComplianceReportInProgress): void {
    if (!reportId) {
      console.error(`Tried to add an undefined reportId for ${address}`);
      return;
    }

    if (!this.reportsInProgress.find(item => item.reportId === reportId)) {
      this.reportsInProgress.push({ reportId, address });
    }
  }

  async poll() {
    if (!this.polling) return;

    let i = this.reportsInProgress.length;

    // Loop through all the reports in progress backwards so we can delete one without breaking the loop
    // If there's one that's not finished emit a progress event
    // If it's finished emit a complete event

    while (i--) {
      const reportInProgress = this.reportsInProgress[i];

      let progress;

      try {
        progress = await this.getReportActivityData(reportInProgress.reportId);
      } catch (e) {
        console.error(e.detail);

        // If it's a 500 error, give up
        if (e.detail.code === 500 || e.detail.code === 424 || e.detail.code === 404) {
          this.reportsInProgress.splice(i, 1);
        }
        this.emitErrorEvent(reportInProgress.address, reportInProgress.reportId, e.message);
        continue;
      }

      if ((progress as IComplianceReportProgress).progressPercent) {
        this.emitProgressEvent(
          reportInProgress.address,
          reportInProgress.reportId,
          (progress as IComplianceReportProgress).progressPercent,
        );
      } else if ((progress as IComplianceActivityReport).reportId) {
        this.emitCompleteEvent(
          reportInProgress.address,
          reportInProgress.reportId,
          progress as IComplianceActivityReport,
        );
        this.reportsInProgress.splice(i, 1);
      }
    }
  }

  emitProgressEvent(address: string, reportId: string, progressPercent: number): void {
    this.emit("report-progress", {
      address,
      reportId,
      progressPercent,
    });
  }

  emitCompleteEvent(address: string, reportId: string, report: IComplianceActivityReport): void {
    this.emit("report-complete", {
      address,
      reportId,
      report,
    });
  }

  emitErrorEvent(address: string, reportId: string, errorMessage: string): void {
    this.emit("error", {
      address,
      reportId,
      errorMessage,
    });
  }

  async getHeaders(): Promise<any> {
    const cacheKey = "getAccessToken";
    return this.cache.tryCachingArray(cacheKey, COMPLIANCE_CACHE_TIME, () => {
      return this.auth0Client.getAccessToken().then(token => ({
        Authorization: `Bearer ${token}`,
      }));
    });
  }

  async getRandomEthereumAddressFromDb(): Promise<string> {
    try {
      const result = await fetch(`${COMPLIANCE_API_URL}/addresses/random`, {
        headers: await this.getHeaders(),
      });

      const data = await result.json();
      return data.address;
    } catch (e) {
      throw new ComplianceError(e);
    }
  }

  async getTenantSubdomain(): Promise<string> {
    try {
      const result = await fetch(`${COMPLIANCE_API_URL}/tenants/me`, {
        headers: await this.getHeaders(),
      });

      const data = await result.json();
      const tenantName: string = data.name;
      return tenantName.toLowerCase();
    } catch (e) {
      throw new ComplianceError(e);
    }
  }

  async generateReportForAddress(address: string): Promise<{ reportId: string }> {
    try {
      const result = await fetch(`${COMPLIANCE_API_URL}/projects/${this.projectId}/reports/aml/addresses/${address}`, {
        headers: await this.getHeaders(),
      });

      const response = await result.json();
      const { reportId } = response.data;

      this.addReportToQueue({ reportId, address });

      return response.data;
    } catch (e) {
      throw new ComplianceError(e);
    }
  }

  async getReportActivityData(reportId: string): Promise<IComplianceActivityReport | IComplianceReportProgress> {
    try {
      const result = await fetch(`${COMPLIANCE_API_URL}/projects/${this.projectId}/reports/aml/${reportId}/activity`, {
        headers: await this.getHeaders(),
      });
      const response = await result.json();
      return response.data;
    } catch (e) {
      throw new ComplianceError(e);
    }
  }

  async getHistoricalReportsForAddress(
    address: string,
    projectId?: string,
  ): Promise<ICompliancePaginatedItems<IComplianceHistoricalReport>> {
    try {
      const result = await fetch(
        `${COMPLIANCE_API_URL}/projects/${projectId || this.projectId}/reports/aml?address=${address}`,
        {
          headers: await this.getHeaders(),
        },
      );

      const response = await result.json();
      return response.data;
    } catch (e) {
      throw new ComplianceError(e);
    }
  }
}
