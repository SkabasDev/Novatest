import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { domainErrorToHttp } from '../../../shared-kernel/domain-error-to-http';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { AuthResponseDto } from '../../application/dto/auth-response.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { RegisterUserDto } from '../../application/dto/register-user.dto';
import { UserProfileResponseDto } from '../../application/dto/user-profile-response.dto';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  @Post('register')
  @ApiCreatedResponse({ type: AuthResponseDto })
  async register(@Body() dto: RegisterUserDto): Promise<AuthResponseDto> {
    const result = await this.registerUserUseCase.execute(dto);

    return result.match(
      ({ user, token }) => AuthResponseDto.fromDomain(user, token),
      (error) => {
        throw domainErrorToHttp(error);
      },
    );
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.loginUserUseCase.execute(dto);

    return result.match(
      ({ user, token }) => AuthResponseDto.fromDomain(user, token),
      (error) => {
        throw domainErrorToHttp(error);
      },
    );
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserProfileResponseDto })
  async me(@CurrentUser() user: { id: string }): Promise<UserProfileResponseDto> {
    const result = await this.getProfileUseCase.execute(user.id);

    return result.match(
      (found) => UserProfileResponseDto.fromDomain(found),
      (error) => {
        throw domainErrorToHttp(error);
      },
    );
  }
}
