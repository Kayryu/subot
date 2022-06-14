import { Injectable, Logger } from "@nestjs/common";
import { Keyring } from "@polkadot/keyring";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { OnEvent } from "@nestjs/event-emitter";
import { Wallet } from "./library/Wallet";
import { TransferMessage } from "./types/message";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  private readonly DEFAULT_CLAIM_AMOUNT: number =
    this.configService.get("FAUCET_AMOUNT") || 10 ** 12;
  private readonly MAX_PENDING_REQUEST: number =
    this.configService.get("FAUCET_PENDING") || 200;
  private readonly LOCK_TIMEOUT: number = 120;

  private doingAccounts: Map<string, number> = new Map();
  private pendingAccounts: TransferMessage[] = [];
  private keyring: Keyring;
  private wallet: Wallet;
  private lock = false;
  private lockTime = 0;

  constructor(
    private eventEmitter: EventEmitter2,
    private configService: ConfigService
  ) {
    const url = this.configService.get("FAUCET_URL");
    const key = this.configService.get("FAUCET_KEY");
    this.logger.log(`Wallet url: ${url}`);
    this.keyring = new Keyring();
    this.wallet = new Wallet(url, key);
  }

  getHello(): string {
    return "Hello kayryu!";
  }

  getPendingList(): TransferMessage[] {
    return this.pendingAccounts;
  }

  addAccount(address: string): string {
    if (this.doingAccounts.has(address)) {
      return "Please wait for the transaction";
    }
    if (this.pendingAccounts.length >= this.MAX_PENDING_REQUEST) {
      return "Exceeded maximum pending number";
    }
    // check format of recipient
    try {
      this.keyring.decodeAddress(address);
    } catch (e) {
      return "Invalid decoded address";
    }
    this.pendingAccounts.push(
      new TransferMessage(address, this.DEFAULT_CLAIM_AMOUNT)
    );

    this.eventEmitter.emit("transfer.triggered", "user");
    return "Ok";
  }

  async getBalance(address: string): Promise<string> {
    await this.wallet.init();
    // check format of recipient
    try {
      this.keyring.decodeAddress(address);
    } catch (e) {
      return "Invalid decoded address";
    }
    return this.wallet.balance(address);
  }

  private now(): number {
    return Math.round(new Date().getTime()/1000)
  }

  @OnEvent("transfer.triggered")
  async handleTransferTriggered(e: string) {
    this.logger.debug(
      `transfer triggered by '${e}', lock status: ${this.lock}, pending amount: ${this.pendingAccounts.length}`
    );
    if (!this.lock && this.pendingAccounts.length != 0) {
      this.lock = true;
      this.lockTime = this.now();
      try {
        this.logger.debug(`select ${this.pendingAccounts.length} account.`);
        await this.wallet.init();
        this.pendingAccounts.forEach((v) => {
          this.doingAccounts.set(v.address, v.amount);
        });

        const result = await this.wallet.batchTransfer(this.doingAccounts);
        this.logger.log(result);
      } catch (e) {
        this.logger.error(e);
      }
      this.pendingAccounts.splice(0, this.doingAccounts.size);
      this.doingAccounts.clear();
      this.lock = false;
    } else {
      if (this.now() - this.lockTime > this.LOCK_TIMEOUT) {
        // Set the timeout period of the lock to avoid deadlocks 
        // because the status cannot be changed due to disconnection 
        // from the node.
        this.lock = false;
      }
    }
  }
}
