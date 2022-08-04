import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { IsDate, IsEmail, IsEnum, IsNumber, IsString } from 'class-validator';
import { UserRoles } from '../enums/user-role';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({ example: 1234, description: 'User id' })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: 'Example@google.com',
    description: 'User unique email',
  })
  @Index({ unique: true })
  @Column({ name: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'example', description: 'User password' })
  @Column({ name: 'password' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'example', description: 'User name' })
  @Column({ name: 'username' })
  @IsString()
  username: string;

  @ApiProperty({ example: '010-1234-5678', description: 'User phone number' })
  @Column({ unique: true, name: 'phone_number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'admin', description: 'User Auth Role' })
  @Column({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.GUEST,
    name: 'role',
  })
  @IsEnum(UserRoles)
  role: UserRoles;

  @ApiProperty({ example: new Date(), description: 'Date timestamptz' })
  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  @IsDate()
  createAt: Date;
}
