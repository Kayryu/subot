import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Interval } from "@nestjs/schedule";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  @Interval(60000)
  handleInterval() {
    this.eventEmitter.emit("transfer.triggered", "timer");
  }
}
