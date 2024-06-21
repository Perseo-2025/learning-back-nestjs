import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';

import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'express';
import { User } from './entities/user.entity';
import { RowHeaders,GetUser, Auth } from './decorators';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';
import { RolesProtected } from './decorators/roles-protected/roles-protected.decorator';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  //Autenticación
  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RowHeaders() rowHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ){
   
  
    return {
      ok: true,
      message: 'Hola mundo Private',
      user,
      userEmail,
      rowHeaders,
      headers
    }
  }
  
  //@SetMetadata('roles', ['admin','super-user'])
  
  //Roles de Usuario
  @Get('private2')
  @RolesProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user: User
  ){

    return {
      ok: true,
      user
    }
  }
  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute3(
    @GetUser() user: User
  ){

    return {
      ok: true,
      user
    }
  }


  // @Get('private2')
  // privateRoute2(
  //     @GetUser() user: User
  // ){

  //   return{
  //     ok: true,
  //     user
  //   }
  // }

}
