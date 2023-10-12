import { DbLibraryModule } from '@app/database';
import { Boat } from '@app/database/entities';
import { AuthModule } from '@auth/auth';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoatsController } from './boats.controller';
import { BoatsService } from './boats.service';

@Module({
  imports: [DbLibraryModule, TypeOrmModule.forFeature([Boat]), AuthModule],
  controllers: [BoatsController],
  providers: [BoatsService],
  exports: [BoatsService],
})
export class BoatsModule {}
