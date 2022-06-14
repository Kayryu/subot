import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { hexToU8a } from "@polkadot/util";
import { TransferMessage } from "../types/message";

export class Wallet {
  private url: string;
  private api: ApiPromise;
  private rich: KeyringPair;

  constructor(url: string, key: string) {
    this.url = url;
    let keyring = new Keyring();
    this.rich = keyring.addFromSeed(hexToU8a(key), null, "sr25519");
  }

  public async init(): Promise<ApiPromise> {
    if (!this.api) {
      const wsProvider = new WsProvider(this.url);
      this.api = await ApiPromise.create({ provider: wsProvider });
    }
    return this.api;
  }

  public async balance(addr: string): Promise<string> {
    const data: any = await this.api.query.system.account(addr);
    return data.data.free.toString();
  }

  public async transfer(tm: TransferMessage) {
    const rich = this.rich;
    const api = this.api;
    let doWithListener = () => {
      return new Promise(function (resolve, reject) {
        api.tx.balances
          .transfer(tm.address, tm.amount)
          .signAndSend(rich, ({ events = [], status }) => {
            if (status.isFinalized) {
              let fets = events.map(
                ({ phase, event: { data, method, section } }) => {
                  return {
                    section: section,
                    method: method,
                    data: data.toString(),
                  };
                }
              );

              let item = fets.find((event) => {
                return (
                  event.section === "system" &&
                  event.method === "ExtrinsicSuccess"
                );
              });
              resolve(item ? "Succeed" : "Failed");
            }
          })
          .catch((err) => {
            reject("transfer error.");
          });
      });
    };
    return await doWithListener();
  }

  public async batchTransfer(tm: Map<string, number>) {
    const rich = this.rich;
    const api = this.api;
    let txs = [];
    tm.forEach((amount, address) => {
      txs.push(api.tx.balances.transfer(address, amount));
    });
    console.log(txs);
    let doWithListener = () => {
      return new Promise(function (resolve, reject) {
        api.tx.utility
          .batch(txs)
          .signAndSend(rich, ({ events = [], status }) => {
            if (status.isFinalized) {
              let fets = events.map(
                ({ phase, event: { data, method, section } }) => {
                  return {
                    section: section,
                    method: method,
                    data: data.toString(),
                  };
                }
              );

              let item = fets.find((event) => {
                return (
                  event.section === "system" &&
                  event.method === "ExtrinsicSuccess"
                );
              });
              resolve(item ? "Succeed" : "Failed");
            }
          })
          .catch((err) => {
            reject("transfer error.");
          });
      });
    };
    return await doWithListener();
  }
}
