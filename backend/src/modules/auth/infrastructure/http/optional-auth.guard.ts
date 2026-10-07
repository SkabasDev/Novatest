import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { TOKEN_SERVICE, TokenServicePort } from '../../domain/ports/token-service.port';
import { AuthenticatedRequest } from './auth.guard';

/**
 * Populates `request.user` when a valid `Authorization: Bearer <token>` header is present, but
 * never blocks the request when it's missing or invalid — for routes that serve both signed-in
 * users and guests (spec v3 §12.7: checkout accepts a session OR guest contact info).
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(@Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Partial<AuthenticatedRequest>>();
    const header = request.headers?.authorization;

    if (header?.startsWith('Bearer ')) {
      const token = header.slice('Bearer '.length).trim();
      const payload = token ? this.tokenService.verify(token) : null;

      if (payload) {
        (request as AuthenticatedRequest).user = { id: payload.sub, email: payload.email };
      }
    }

    return true;
  }
}
