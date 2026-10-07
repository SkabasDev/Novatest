import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../domain/user.entity';

/** Never includes passwordHash — this is the only shape a User is allowed to leave the backend in. */
export class UserProfileResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() email: string;
  @ApiProperty() phone: string;
  @ApiProperty() documentId: string;
  @ApiProperty({ nullable: true }) defaultAddress: string | null;
  @ApiProperty({ nullable: true }) defaultCity: string | null;

  static fromDomain(user: User): UserProfileResponseDto {
    const dto = new UserProfileResponseDto();
    dto.id = user.id;
    dto.fullName = user.fullName;
    dto.email = user.email;
    dto.phone = user.phone;
    dto.documentId = user.documentId;
    dto.defaultAddress = user.defaultAddress;
    dto.defaultCity = user.defaultCity;
    return dto;
  }
}
