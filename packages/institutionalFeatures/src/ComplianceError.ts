interface ErrorDetail {
  code: number;
  body: string;
}

export class ComplianceError extends Error {
  public detail: ErrorDetail;

  constructor(e: any) {
    let detail: string;
    const statusCode = e.response?.status;
    let body = e.response?.data;

    if (statusCode && body) {
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
          detail = body.message;
        } catch (e) {
          detail = body;
        }
      } else if (typeof body === "object" && body.message) {
        detail = body.message;
      }

      const errorMessage = `${statusCode}: ${detail}`;
      super(errorMessage);

      Object.setPrototypeOf(this, ComplianceError.prototype); // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

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
