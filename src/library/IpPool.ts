export const IPState = {
    // Never receive coin
    UnKnown : 0,
    // Reach maximum count in specified time
    Locked : 1,
    // Can receive coin
    Release : 2,
    // End freezing, need reset cache
    UnLocked : 3
  }

class Info {
    public ip: string;
    public time: number;
    public count: number;
}

export class IpPool {
    
    private infos: Info[];
    private maxCount: number;
    private lockTime: number;

    constructor(maxCount: number, lockTime: number) {
        this.infos = [];
        this.maxCount = maxCount;
        this.lockTime = lockTime; // second
    }
  
    public exist(ip: string): boolean {
        return this.infos.find((v) => v.ip == ip) != undefined;
    }
  
    public get(ip: string): Info {
        return this.infos.find((v) => v.ip == ip);
    }
  
    public delete(ip: string) {
        let index = this.infos.findIndex((v) => {return v.ip == ip;});
        if (index != -1) {
            this.infos.splice(index, 1);
        }
    }
  
    public put(ip: string) {
        if (!this.exist(ip)){
            
            let info = {
                ip: ip,
                time: this.now() + this.lockTime * 1000,
                count: 1
            }
            this.infos.push(info)
        } else {
            let info  = this.get(ip);
            info.count++;
        }
    }
  
    public check(ip: string) {
        if (this.exist(ip)) {
            let info = this.get(ip);
            if (info.time > this.now()) {
                if (info.count >= this.maxCount) {
                    return IPState.Locked;
                } else {
                    return IPState.Release;
                }
            } else {
                return IPState.UnLocked;
            }
        } else {
            return IPState.UnKnown;
        }
    }
  
    public time(ip: string) {
        if (this.exist(ip)) {
            let bas = this.get(ip).time - this.now();
            return bas > 0 ? bas: 0;
        } else {
            return 0;
        }
    }

    private now(): number {
        let date = new Date();
        return date.getTime()
    }
  }