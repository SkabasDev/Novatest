import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { DomainError, DomainErrorCode } from './domain-error';

/** Maps a domain-level error to the corresponding HTTP exception. Used only at controllers (the hexagon's edge). */
export function domainErrorToHttp(error: DomainError): HttpException {
  const payload = { message: error.message, code: error.code, details: error.details };

  switch (error.code) {
    case DomainErrorCode.VALIDATION_ERROR:
      return new BadRequestException(payload);
    case DomainErrorCode.NOT_FOUND:
      return new NotFoundException(payload);
    case DomainErrorCode.INSUFFICIENT_STOCK:
    case DomainErrorCode.INVALID_TRANSACTION_STATE:
      return new ConflictException(payload);
    case DomainErrorCode.PAYMENT_DECLINED:
      return new BadRequestException(payload);
    case DomainErrorCode.PAYMENT_GATEWAY_UNAVAILABLE:
      return new ServiceUnavailableException(payload);
    case DomainErrorCode.EMAIL_ALREADY_EXISTS:
      return new ConflictException(payload);
    case DomainErrorCode.INVALID_CREDENTIALS:
    case DomainErrorCode.UNAUTHORIZED:
      return new UnauthorizedException(payload);
    default:
      return new BadRequestException(payload);
  }
}
