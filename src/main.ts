import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { cryptoWaitReady } from "@polkadot/util-crypto";

async function bootstrap() {
  await cryptoWaitReady();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(9955);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
