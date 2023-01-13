import ISDKCache from "./types";

export class SimpleCache {
  private cache: ISDKCache = {};

  public async tryCachingArray<T>(key: string, maxCacheAgeSeconds: number, fn): Promise<T[]> {
    if (maxCacheAgeSeconds >= 0) {
      if (this.cacheExists(key) && this.cacheValid(key, maxCacheAgeSeconds)) {
        return this.cache[key].results;
      }
    }

    const results = await fn();

    this.cache[key] = {
      results,
      timestamp: new Date().getTime(),
    };

    return results;
  }

  public setCache<T>(key: string, value: T): void {
    this.cache[key] = {
      results: value,
      timestamp: new Date().getTime(),
    };
  }

  public getCache<T>(key: string): T {
    if (this.cacheExists(key)) {
      return this.cache[key].results;
    }

    return null;
  }

  public cacheExists(key): boolean {
    return this.cache.hasOwnProperty(key);
  }

  public cacheValid(key, maxCacheAgeSeconds): boolean {
    const cache = this.cache[key];
    const maxCacheAgeMs = maxCacheAgeSeconds * 1000;
    return new Date().getTime() - cache.timestamp < maxCacheAgeMs;
  }

  public deleteCache(key): void {
    if (this.cacheExists(key)) {
      delete this.cache[key];
    }
  }
}
