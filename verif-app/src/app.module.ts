import { Module } from '@nestjs/common';
import { ValidateModule } from './validate/validate.module';

@Module({
  imports: [ValidateModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
