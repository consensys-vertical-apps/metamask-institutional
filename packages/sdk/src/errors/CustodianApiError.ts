interface ErrorDetail {
  code: number;
  body: string;
}

export class CustodianApiError extends Error {
  public detail: ErrorDetail;

  // This is really nasty, we should have one for each custodian
  // TODO issue: https://consensyssoftware.atlassian.net/browse/MMI-583
  // A lot of the early if/else come from Curv which has inconsistent errors

  constructor(e: any, requestId?: string) {
    const statusCode = e.response?.status;
    let detail: string;
    let body = e.response?.data;

    let requestMeta = "";
    if (requestId) {
      requestMeta += `(Request ID: ${requestId})`;
    }

    if (statusCode && body) {
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
          detail = body.detail;
        } catch (e) {
          detail = body;
        }
      } else if (typeof body === "object" && (body.detail || body.message)) {
        if (typeof body.detail === "string") {
          detail = body.detail;
        } else if (typeof body.detail?.reason === "string") {
          detail = body.detail.reason;
        } else if (typeof body.message === "string") {
          // Cactus
          detail = body.message;
        } else {
          //Give up
          detail = JSON.stringify(body.detail);
        }
      }

      // Avoid putting redirect or cloudflare HTML in the errors
      // This is a Qredo thing

      if (statusCode === 502) {
        detail = `Gateway timeout reaching ${e.config?.url}`;
      }

      if (!detail) {
        detail = e.message;
      }

      const errorMessage = `${statusCode}: ${detail} ${requestMeta}`;
      super(errorMessage);

      Object.setPrototypeOf(this, CustodianApiError.prototype); // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

      this.detail = {
        code: statusCode,
        body: detail,
      };
    } else {
      super(e.message);

      this.detail = {
        code: 0,
        body: e.message,
      };
    }
  }
}
