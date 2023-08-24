import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

@Schema({
  timestamps: true,
})
export class UserFileUpload {
  @Prop()
  shortUrlId: string;

  @Prop()
  awsUrl: string;

  @Prop()
  shortUrl: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const UserFileUploadSchema = SchemaFactory.createForClass(UserFileUpload);
