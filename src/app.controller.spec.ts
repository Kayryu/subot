import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ScheduleModule } from "@nestjs/schedule";
import { TasksModule } from "./tasks/tasks.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ConfigModule } from "@nestjs/config";
import { cryptoWaitReady } from "@polkadot/util-crypto";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    await cryptoWaitReady();
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ScheduleModule.forRoot(),
        ConfigModule.forRoot(),
        TasksModule,
        EventEmitterModule.forRoot(),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it("(Time)", () => {
    let time = Math.round(new Date().getTime() / 1000);
    console.log("Unix time:", time);
  });
});
