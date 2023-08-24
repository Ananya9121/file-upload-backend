import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    try {
      const { username, email, password } = signUpDto;

      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = await this.userModel.create({
        username,
        email,
        password: hashedPassword,
      });
  
      const token = this.jwtService.sign({ id: user._id });
  
      return { token };
    } catch (error) {
      {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
          throw new HttpException('Email address already exists', HttpStatus.BAD_REQUEST);
        }
        throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
      }    }
   
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    try {
      const { email, password } = loginDto;

      const user = await this.userModel.findOne({ email });
  
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }
  
      const isPasswordMatched = await bcrypt.compare(password, user.password);
  
      if (!isPasswordMatched) {
        throw new UnauthorizedException('Invalid email or password');
      }
  
      const token = this.jwtService.sign({ id: user._id });
  
      return { token };
    } catch (error) {
      throw error;
    }
   
  }
}