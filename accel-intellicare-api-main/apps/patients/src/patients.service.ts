import { Patients } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';

@Injectable()
export class PatientsService extends TypeOrmCrudService<Patients> {
  constructor(@InjectRepository(Patients) repo) {
    super(repo);
  }

  async patientsList() : Promise<any>{
    
    const patients : Patients[] = await this.repo
      .createQueryBuilder('patients')
      .select([
        'u.name AS patientName', 
        'u.date_of_birth AS patientDateOfBirth', 
        'patients.uuid AS patientID', 
        'patients.social_security_number AS patientSSN', 
      ])
      .innerJoin('users', 'u', 'patients.user_id = u.id')
      .getRawMany();

    return patients;
  }
}
