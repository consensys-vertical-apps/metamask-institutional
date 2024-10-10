export interface IApiCallLogEntry {
  method: string;
  endpoint: string;
  success: boolean;
  timestamp: string;
  errorMessage?: string;
  responseData?: any;
}
