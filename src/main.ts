import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{ cors: true });

  app.useGlobalPipes(new ValidationPipe());
  const port= process.env.PORT
  await app.listen(port,()=>{console.log(`server started on port ${port}`)});
}
bootstrap();
