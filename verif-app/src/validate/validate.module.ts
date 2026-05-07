import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ValidateController } from './validate.controller';
import { ValidateService } from './validate.service';

@Module({
  imports: [HttpModule],
  controllers: [ValidateController],
  providers: [ValidateService],
})
export class ValidateModule {}