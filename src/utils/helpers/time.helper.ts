export class TimeHelper {
    static getEpochNowSecond(): number {
        return Math.floor(Date.now() / 1000);
    }
}