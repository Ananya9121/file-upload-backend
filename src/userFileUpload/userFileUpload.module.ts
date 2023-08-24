import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { UserFileUploadController } from './userFileUpload.controller';
import { UserFileUploadService } from './userFileUpload.service';
import { UserFileUploadSchema } from './schemas/userFileUpload.schema'; 
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'UserFileUpload', schema: UserFileUploadSchema }]), 
  ],
  controllers: [UserFileUploadController],
  providers: [UserFileUploadService], 
})
export class UserFileUploadModule {} 