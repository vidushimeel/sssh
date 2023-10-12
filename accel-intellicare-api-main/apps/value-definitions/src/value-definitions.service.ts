import { ValueDefinition } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';

@Injectable()
export class ValueDefinitionsService extends TypeOrmCrudService<ValueDefinition> {
  constructor(@InjectRepository(ValueDefinition) repo) {
    super(repo);
  }
}
