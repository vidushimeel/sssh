import { DbLibraryModule } from '@app/database';
import { DefinitionType, ValueDefinition } from '@app/database/entities';
import { AuthModule } from '@auth/auth';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValueDefinitionsController } from './value-definitions.controller';
import { ValueDefinitionsService } from './value-definitions.service';

@Module({
  imports: [
    DbLibraryModule,
    TypeOrmModule.forFeature([ValueDefinition, DefinitionType]),
    AuthModule,
  ],
  controllers: [ValueDefinitionsController],
  providers: [ValueDefinitionsService],
  exports: [ValueDefinitionsService],
})
export class ValueDefinitionsModule {}
