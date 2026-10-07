import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { TOKEN_SERVICE, TokenServicePort } from '../../domain/ports/token-service.port';

export interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

/** Requires a valid `Authorization: Bearer <token>` header; injects `request.user`. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const payload = this.tokenService.verify(token);

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    request.user = { id: payload.sub, email: payload.email };
    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) return null;
    return header.slice('Bearer '.length).trim() || null;
  }
}
