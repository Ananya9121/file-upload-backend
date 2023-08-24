import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  UploadedFile,
  Redirect,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserFileUploadService } from './userFileUpload.service'; // Update the import
import { UserFileUpload } from './schemas/userFileUpload.schema'; // Update the import

import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('userFileUpload') // Update the route prefix
export class UserFileUploadController { // Update the class name
  constructor(private userFileUploadService: UserFileUploadService) {}

  //fetching all files of user
  @Get()
  @UseGuards(AuthGuard())
  public async getUsersAllFiles(@Res() res, @Req() req): Promise<UserFileUpload[]>{
      const allUsersFiles = await this.userFileUploadService.getAllFiles(req.user);
      return res.status(HttpStatus.OK).json(allUsersFiles);
  }

  //upload user file
  @Post("/upload")
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('file'))
  async addBusinessPartnerInvite(@Res() res, @Req() req,@UploadedFile() file: Express.Multer.File): Promise<UserFileUpload> {
    const uploadResponse = await this.userFileUploadService.uploadUserFile( file, req.user);
    return res.status(HttpStatus.OK).json(uploadResponse);
  }

  //redirecting to aws-url
  @Get(':uniqueCode')
  @UseGuards(AuthGuard())
  @Redirect('Downloading')
  async redirectToUrl(@Param('uniqueCode') uniqueCode: string, @Res() res) {
    const url = await this.userFileUploadService.fetchUrl(uniqueCode);
    return res.status(HttpStatus.OK).json(url);
  }

  //expiring files after 10 days
  @Cron('0 0 * * *')// Cron to run every midNight
  async expireFilesUsingCron() {
      await this.userFileUploadService.expireFiles();
  }

  //deleteing a file by user
  @Delete('deleteFile/:id')
  @UseGuards(AuthGuard())
  async deleteBook(
    @Param('id')
    id: string,
  ): Promise<any> {
    return this.userFileUploadService.deleteById(id);
  }

}
