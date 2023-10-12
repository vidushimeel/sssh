import { Boat } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';

@Injectable()
export class BoatsService extends TypeOrmCrudService<Boat> {
  constructor(@InjectRepository(Boat) repo) {
    super(repo);
  }

  message = (newMessage: string): string => {
    return `${newMessage}`;
  };
}
