import { Body, Controller, Res, Post, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }


  //signing up a user
  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto, @Res() res): Promise<{ token: string }> {
    const signUpResponse =await this.authService.signUp(signUpDto);
    return res.status(HttpStatus.OK).json(signUpResponse);
  }


  //loging a user
  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res() res): Promise<{ token: string }> {
    const loginResponse = await this.authService.login(loginDto);
    return res.status(HttpStatus.OK).json(loginResponse);
  }
}
