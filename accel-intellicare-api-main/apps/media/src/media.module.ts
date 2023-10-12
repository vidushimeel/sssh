import { DbLibraryModule } from '@app/database';
import { AppointmentMeeting } from '@app/database/entities';
import { AuthModule } from '@auth/auth';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MailModule } from '@app/mail';

@Module({
  imports: [DbLibraryModule, TypeOrmModule.forFeature([AppointmentMeeting]), AuthModule, MailModule ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})

export class MediaModule {}