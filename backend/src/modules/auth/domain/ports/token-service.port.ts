export interface TokenPayload {
  sub: string;
  email: string;
}

export const TOKEN_SERVICE = 'TOKEN_SERVICE';

export interface TokenServicePort {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload | null;
}
