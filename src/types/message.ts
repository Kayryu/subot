export class TransferMessage {
    public address:string;
    public amount:number;
  
    public constructor(address: string, amount: number) {
      this.address = address;
      this.amount = amount;
    }

    public toJson() {
      return JSON.stringify(this);
    }
  }
  