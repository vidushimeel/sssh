import { DbLibraryModule } from '@app/database';
import { Patients } from '@app/database/entities';
import { AuthModule } from '@auth/auth';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';

@Module({
  imports: [DbLibraryModule, TypeOrmModule.forFeature([Patients]), AuthModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})

export class PatientsModule {}