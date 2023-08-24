import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserFileUpload } from './schemas/userFileUpload.schema'; // Update the import
import { ConfigService } from '@nestjs/config';
import { User } from '../auth/schemas/user.schema';
import { S3 } from 'aws-sdk';

@Injectable()
export class UserFileUploadService { // Rename the service class
  constructor(
    @InjectModel(UserFileUpload.name) // Update the model injection
    private userFileUploadModel: Model<UserFileUpload>, // Update the model type
    private configService: ConfigService
  ) {}

  
  public async getAllFiles(user:User): Promise<UserFileUpload[]> {
    const allFiles = await this.userFileUploadModel.find({ 'user': user._id });
    return allFiles;
}

  public getS3Config(): S3.Types.ClientConfiguration {
    return {
      accessKeyId: this.configService.get<string>("S3_ACCESS_KEY"), 
      secretAccessKey: this.configService.get<string>("S3_SECRET_KEY"),
    }
  }

  public async uploadFile( file: Express.Multer.File) {
    const s3 = new S3(this.getS3Config());
    const key = file.originalname;
    const uploadResult = await s3.upload({ Bucket: this.configService.get<string>("FILE_UPLOAD_BUCKET"), Body: file.buffer, Key: key }).promise();
    return uploadResult;
  }

  generateUniqueCode() {
    const length = 8;
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeArray = [];
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      codeArray.push(characters[randomIndex]);
    }
    
    const randomCode = codeArray.join('');
    return randomCode;
  }


  async uploadUserFile(file: Express.Multer.File, user:User): Promise<UserFileUpload> {
    try {
      if(!file) throw new BadRequestException('Please select file to upload.');
     const UploadedFile= await this.uploadFile(file)
          const uniqueCode = this.generateUniqueCode();
          const redirectUrl = `${this.configService.get<string>("FRONT_END_URL")}/${uniqueCode}`;
          const userFileData ={shortUrlId:uniqueCode,awsUrl:UploadedFile.Location,shortUrl:redirectUrl,user:user._id}
          const res = await this.userFileUploadModel.create(userFileData);
        return res;
    } catch (error) {
      throw error;
    }
  }



  async expireFiles(): Promise<any> {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  
    try {
      return await this.userFileUploadModel.updateMany(
        { createdAt: { $lte: tenDaysAgo } },
        { $set: { isDeleted: true } }
      ).exec();
    } catch (error) {
      throw new Error('Failed to update documents: ' + error);
    }
  }

  async fetchUrl(uniqueCode: string): Promise<string> {
    const userFileData = await this.userFileUploadModel.findOne({ shortUrlId:uniqueCode }).exec()
    return userFileData.awsUrl;
  }

  async deleteById(id: string): Promise<UserFileUpload> {
    return await this.userFileUploadModel.findByIdAndDelete(id);
  }
  
}
