import { CUSTODIAN_TYPES } from "@metamask-institutional/custody-keyring";
import { ObservableStore } from "@metamask/obs-store";

import { Auth0 } from "./Auth0";
import { Compliance } from "./Compliance";
import { IComplianceHistoricalReport, ICompliancePaginatedItems } from "./types";

/**
 * @typedef {Object} InstitutionalFeaturesOptions
 * @property {Object} initState The initial controller state
 */

/**
 * Background controller responsible for maintaining
 * a cache of institutional features data in local storage
 */
export class InstitutionalFeaturesController {
  public showConfirmRequest;
  public store;
  public complianceClient: Compliance;
  /**
   * Creates a new controller instance
   *
   * @param {InstitutionalFeaturesOptions} [opts] - Controller configuration parameters
   */
  constructor(opts: any = {}) {
    this.showConfirmRequest = opts.showConfirmRequest;
    const initState = opts.initState?.institutionalFeatures
      ? opts.initState
      : {
          institutionalFeatures: {
            reportsInProgress: {},
            connectRequests: [],
          },
        };

    if (initState.institutionalFeatures?.complianceProjectId) {
      this.startPolling(
        initState.institutionalFeatures.complianceProjectId,
        initState.institutionalFeatures.complianceClientId,
      );
    }

    this.store = new ObservableStore({
      institutionalFeatures: {
        ...initState.institutionalFeatures,
        reportsInProgress: {
          ...initState.institutionalFeatures.reportsInProgress,
        },
        connectRequests: [...(initState.institutionalFeatures.connectRequests || [])],
      },
    });
  }

  async startPolling(projectId?: string, clientId?: string): Promise<void> {
    console.log("Compliance: start polling");

    await this.addClientIfNotExists(projectId, clientId);
    this.complianceClient.startPolling();
    this.complianceClient.on("report-progress", e => this.handleReportProgress(e));
    this.complianceClient.on("report-complete", e => this.handleReportComplete(e));
  }

  handleReportProgress(progressData: { address: string; reportId: string; progressPercent: number }): void {
    const state = this.store.getState();
    this.store.updateState({
      institutionalFeatures: {
        ...state.institutionalFeatures,
        reportsInProgress: {
          ...state.institutionalFeatures.reportsInProgress,
          [progressData.address.toLowerCase()]: [
            ...(state.institutionalFeatures.reportsInProgress[progressData.address.toLowerCase()] || []).filter(
              report => report.reportId !== progressData.reportId,
            ),
            {
              reportId: progressData.reportId,
              progress: progressData.progressPercent,
              address: progressData.address,
            },
          ],
        },
      },
    });
  }

  handleReportComplete(completeData: { address: string; reportId: string }): void {
    const state = this.store.getState();
    this.store.updateState({
      institutionalFeatures: {
        ...state.institutionalFeatures,
        reportsInProgress: {
          ...state.institutionalFeatures.reportsInProgress,
          [completeData.address.toLowerCase()]: [
            ...(state.institutionalFeatures.reportsInProgress[completeData.address.toLowerCase()] || []).filter(
              report => report.reportId !== completeData.reportId,
            ),
          ],
        },
      },
    });
  }

  getComplianceProjectId(): string {
    return this.store.getState().institutionalFeatures.complianceProjectId;
  }

  async setComplianceAuthData({ clientId, projectId }: { clientId: string; projectId: string }): Promise<void> {
    const state = this.store.getState();

    await this.addClientIfNotExists(projectId, clientId);

    const complianceTenantSubdomain = await this.complianceClient.getTenantSubdomain();

    this.store.updateState({
      institutionalFeatures: {
        ...state.institutionalFeatures,
        complianceProjectId: projectId,
        complianceClientId: clientId, // '5kQHg48BQJR2QuGTs1EX4V5OJZI8RA2k',
        complianceTenantSubdomain,
      },
    });

    this.startPolling(projectId, clientId);
  }

  deleteComplianceAuthData(): void {
    const state = this.store.getState();

    this.store.updateState({
      institutionalFeatures: {
        ...state.institutionalFeatures,
        complianceProjectId: undefined,
        complianceClientId: undefined,
      },
    });

    if (this.complianceClient) {
      this.complianceClient.stopPolling();
      delete this.complianceClient;
    }
  }

  async generateComplianceReport(address: string): Promise<void> {
    const state = this.store.getState();

    await this.addClientIfNotExists();

    return this.complianceClient.generateReportForAddress(address).then(result => {
      this.store.updateState({
        institutionalFeatures: {
          ...state.institutionalFeatures,
          reportsInProgress: {
            ...state.institutionalFeatures.reportsInProgress,
            [address.toLowerCase()]: [
              ...(state.institutionalFeatures.reportsInProgress[address.toLowerCase()] || []).filter(
                report => report.reportId !== result.reportId,
              ),
              {
                reportId: result.reportId,
                progress: 0,
                address,
              },
            ],
          },
        },
      });
    });
  }

  addReportInProgress({ reportId, address }: { reportId: string; address: string }): void {
    return this.complianceClient.addReportToQueue({ reportId, address });
  }

  syncReportsInProgress({ address, historicalReports }: { address: string; historicalReports: any[] }): void {
    const state = this.store.getState();
    const reportsInProgress = state.institutionalFeatures.reportsInProgress[address.toLowerCase()] || [];
    const newReportsInProgress = historicalReports.filter(
      report => !reportsInProgress.filter(historical => historical.reportId === report.reportId),
    );
    const reportsIdsToRemove = historicalReports
      .filter(
        report =>
          reportsInProgress.filter(
            historical => historical.reportId === report.reportId && report.status !== "inProgress",
          ).length > 0,
      )
      .map(report => report.reportId);

    reportsInProgress
      .filter(item => reportsIdsToRemove.indexOf(item.reportId) === -1)
      .forEach(item =>
        this.addReportInProgress({
          reportId: item.reportId,
          address: item.address,
        }),
      );
    newReportsInProgress.forEach(item =>
      this.addReportInProgress({
        reportId: item.reportId,
        address: item.address,
      }),
    );
    this.store.updateState({
      institutionalFeatures: {
        ...state.institutionalFeatures,
        reportsInProgress: {
          ...state.institutionalFeatures.reportsInProgress,
          [address.toLowerCase()]: [
            ...(state.institutionalFeatures.reportsInProgress[address.toLowerCase()]
              ? state.institutionalFeatures.reportsInProgress[address.toLowerCase()].filter(
                  item => reportsIdsToRemove.indexOf(item.reportId) === -1,
                )
              : []),
          ],
        },
      },
    });
  }

  getComplianceHistoricalReportsByAddress(
    address: string,
    projectId: string,
  ): Promise<ICompliancePaginatedItems<IComplianceHistoricalReport>> {
    this.addClientIfNotExists();

    return this.complianceClient.getHistoricalReportsForAddress(address, projectId);
  }

  authenticateToCodefiCompliance(
    origin: string,
    token: string,
    labels: { key: string; value: any }[],
    feature: string,
    service: string,
  ): void {
    // TODO: Re-enable this once we are through local testing?
    // if (!/^https:\/\/compliance.codefi.network/u.test(origin)) {
    //   throw new Error(`Invalid origin ${origin} for service codefi-compliance`);
    // }
    const state = this.store.getState();
    this.store.updateState({
      institutionalFeatures: {
        ...state.institutionalFeatures,
        connectRequests: [...state.institutionalFeatures.connectRequests, { origin, token, labels, feature, service }],
      },
    });
    this.showConfirmRequest();
  }

  authenticateToCustodian(
    origin: string,
    method: string,
    token: string,
    labels: { key: string; value: any }[],
    feature: string,
    service: string,
    apiUrl?: string,
    chainId?: string,
    environment?: string,
  ): void {
    if (!CUSTODIAN_TYPES[service.toUpperCase()]) {
      throw new Error("No such custodian");
    }
    const state = this.store.getState();
    this.store.updateState({
      institutionalFeatures: {
        ...state.institutionalFeatures,
        connectRequests: [
          ...state.institutionalFeatures.connectRequests,
          {
            origin,
            method,
            token,
            labels,
            feature,
            service,
            apiUrl,
            chainId,
            environment,
          },
        ],
      },
    });
    this.showConfirmRequest();
  }

  handleMmiAuthenticate(req: {
    origin: string;
    method: string;
    params: {
      token: string;
      labels: { key: string; value: any }[];
      feature: string;
      service: string;
      apiUrl?: string;
      chainId?: string;
      environment?: string;
    };
  }): boolean {
    if (!req.params.feature) {
      throw new Error("Missing parameter: feature");
    }
    if (!req.params.service) {
      throw new Error("Missing parameter: service");
    }
    if (!req.params.token) {
      throw new Error("Missing parameter: token");
    }

    // Ignore features for now
    switch (req.params.feature) {
      case "compliance":
        this.authenticateToCodefiCompliance(
          req.origin,
          req.params.token,
          req.params.labels,
          req.params.feature,
          req.params.service,
        );
        break;
      case "custodian":
        this.authenticateToCustodian(
          req.origin,
          req.method,
          req.params.token,
          req.params.labels,
          req.params.feature,
          req.params.service,
          req.params.apiUrl,
          req.params.chainId,
          req.params.environment,
        );
        break;
      default:
        throw new Error(`Service ${req.params.service} not supported`);
    }

    return true;
  }

  removeConnectInstitutionalFeature({ origin, projectId }: { origin: string; projectId: string }): void {
    const state = this.store.getState();
    this.store.updateState({
      institutionalFeatures: {
        ...state.institutionalFeatures,
        connectRequests: state.institutionalFeatures.connectRequests.filter(
          request => request.origin !== origin || request.token.projectId !== projectId,
        ),
      },
    });
  }

  removeAddTokenConnectRequest({ origin, apiUrl, token }: { origin: string; apiUrl: string; token: string }): void {
    const state = this.store.getState();
    this.store.updateState({
      institutionalFeatures: {
        ...state.institutionalFeatures,
        connectRequests: state.institutionalFeatures.connectRequests.filter(
          request => !(request.origin === origin && request.token === token && request.apiUrl === apiUrl),
        ),
      },
    });
  }

  async addClientIfNotExists(
    projectId: string = this.store.getState().institutionalFeatures?.complianceProjectId,
    clientId: string = this.store.getState().institutionalFeatures?.complianceClientId,
  ): Promise<void> {
    if (this.complianceClient) {
      return;
    }

    if (!projectId) {
      throw new Error("No projectId");
    }

    const auth0 = new Auth0();
    await auth0.createClient({
      domain: "codefi-prod.us.auth0.com",
      clientId: clientId,
      // eslint-disable-next-line no-undef
      // @ts-ignore
      redirect_uri: `chrome-extension://${global.chrome.runtime.id}`, // This has to be set individually for every extension instance nad has to be whitelisted in Auth0
      audience: "https://admin.codefi.network",
    });
    this.complianceClient = new Compliance(projectId, auth0);
  }
}
