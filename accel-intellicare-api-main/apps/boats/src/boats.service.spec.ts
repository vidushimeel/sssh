import { Boat } from '@app/database/entities';
import { MockRepository } from '@app/database/mockrepository';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoatsService } from './boats.service';

describe('BoatsService', () => {
  let service: BoatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoatsService,
        {
          provide: getRepositoryToken(Boat),
          useClass: MockRepository,
        },
      ],
    }).compile();

    service = module.get<BoatsService>(BoatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
