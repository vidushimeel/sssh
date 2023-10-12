import { DbLibraryModule } from '@app/database';
import { Boat } from '@app/database/entities';
import { MockRepository } from '@app/database/mockrepository';
import { AuthModule } from '@auth/auth';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { BoatsController } from './boats.controller';
import { BoatsService } from './boats.service';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};

describe('BoatsController', () => {
  let boatsController: BoatsController;
  // let service: BoatsService;
  // let repository: MockType<Repository<Boat>>;
  // const req: CrudRequest = { parsed: null, options: null };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [DbLibraryModule, TypeOrmModule.forFeature([Boat]), AuthModule],
      controllers: [BoatsController],
      providers: [
        BoatsService,
        { provide: getRepositoryToken(Boat), useClass: MockRepository },
      ],
    }).compile();

    boatsController = app.get<BoatsController>(BoatsController);
    // service = app.get<BoatsService>(BoatsService);
    // repository = app.get(getRepositoryToken(Boat));
  });

  describe('root', () => {
    it('should return "This action returns all cats for version 1 edited"', async () => {
      expect(boatsController.findAllV1()).toBe(
        'This action returns all cats for version 1 edited',
      );
    });
  });
});
