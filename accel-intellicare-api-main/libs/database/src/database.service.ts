import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ValueDefinition } from './entities';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(ValueDefinition)
    private valueDefinitionRepository: Repository<ValueDefinition>,
  ) {}

  getValueDefinitionId = async (
    definitionType: string,
    valueDefinition: string,
  ): Promise<ValueDefinition> => {
    const value = this.valueDefinitionRepository
      .createQueryBuilder('valueDefinitions')
      .innerJoinAndSelect('valueDefinitions.definitionType', 'definitionType')
      .where('definitionType.definition_type = :definition_type', {
        definition_type: definitionType,
      })
      .andWhere('valueDefinitions.valueDefinition = :valueDefinition', {
        valueDefinition,
      });
    return value.getOneOrFail();
  };
}
