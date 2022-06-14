import { Controller, Get, Param, Req, Request } from "@nestjs/common";
import { IpPool, IPState } from "./library/IpPool";
import { AppService } from "./app.service";
import { RealIP } from "nestjs-real-ip";

@Controller()
export class AppController {
  private ipPool = new IpPool(10, 25200);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() request: Request): string {
    console.log(request.headers);
    return this.appService.getHello();
  }

  @Get("drop/:address")
  public async getCoin(@Param() params, @RealIP() ip: string): Promise<string> {
    const address = params.address;

    console.log(`${ip}, ${address}`);

    const checkResult = this.ipPool.check(ip);
    if (checkResult == IPState.Locked) {
      //locked
      return "Reach maximum count in specified time, Please retry after one day.";
    } else {
      if (checkResult == IPState.UnLocked) {
        //unlocked
        this.ipPool.delete(ip);
      }
      const result = this.appService.addAccount(address);
      this.ipPool.put(ip);
      return result;
    }
  }

  @Get("pending")
  public async getPending(): Promise<string> {
    const result = this.appService.getPendingList();
    return result.map((v) => v.toJson()).toString();
  }

  @Get("balance/:address")
  public async getBalance(@Param() params): Promise<string> {
    const address = params.address;
    return this.appService.getBalance(address);
  }
}
