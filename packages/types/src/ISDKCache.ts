export default interface ISDKCache {
  [key: string]: {
    timestamp: number;
    results: any;
  };
}
