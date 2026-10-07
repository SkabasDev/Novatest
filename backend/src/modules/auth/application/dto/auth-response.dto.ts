import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../domain/user.entity';
import { UserProfileResponseDto } from './user-profile-response.dto';

export class AuthResponseDto {
  @ApiProperty() token: string;
  @ApiProperty({ type: UserProfileResponseDto }) user: UserProfileResponseDto;

  static fromDomain(user: User, token: string): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.token = token;
    dto.user = UserProfileResponseDto.fromDomain(user);
    return dto;
  }
}
