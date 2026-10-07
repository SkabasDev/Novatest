import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PASSWORD_HASHER } from './domain/ports/password-hasher.port';
import { TOKEN_SERVICE } from './domain/ports/token-service.port';
import { USER_REPOSITORY } from './domain/ports/user-repository.port';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { SaveDefaultDeliveryUseCase } from './application/use-cases/save-default-delivery.use-case';
import { AuthController } from './infrastructure/http/auth.controller';
import { AuthGuard } from './infrastructure/http/auth.guard';
import { OptionalAuthGuard } from './infrastructure/http/optional-auth.guard';
import { BcryptPasswordHasherAdapter } from './infrastructure/security/bcrypt-password-hasher.adapter';
import { JwtTokenServiceAdapter } from './infrastructure/security/jwt-token-service.adapter';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { UserTypeOrmRepository } from './infrastructure/persistence/user.typeorm.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '2h') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasherAdapter },
    { provide: TOKEN_SERVICE, useClass: JwtTokenServiceAdapter },
    RegisterUserUseCase,
    LoginUserUseCase,
    GetProfileUseCase,
    SaveDefaultDeliveryUseCase,
    AuthGuard,
    OptionalAuthGuard,
  ],
  exports: [AuthGuard, OptionalAuthGuard, SaveDefaultDeliveryUseCase, GetProfileUseCase],
})
export class AuthModule {}
