export class TimerService {
  private interval;

  constructor(callback: () => void, interval: number) {
    this.interval = setInterval(callback, interval);
  }
}
