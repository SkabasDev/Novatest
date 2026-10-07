import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload, TokenServicePort } from '../../domain/ports/token-service.port';

@Injectable()
export class JwtTokenServiceAdapter implements TokenServicePort {
  private readonly logger = new Logger(JwtTokenServiceAdapter.name);

  constructor(private readonly jwtService: JwtService) {}

  sign(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch (error) {
      this.logger.warn(`Token verification failed: ${(error as Error).message}`);
      return null;
    }
  }
}
