import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, } from "class-validator";
import { UserRoleEnum } from "../../enums/user-role.enum";

export class CreateUserDto {
    @ApiProperty({ description: "le username" , example: "ouma" })
    @IsString()
    username: string;
        
    @ApiProperty({ description: "l'email" , example: "ouma@gmail.com"})
    @IsString()
    email: string;
    
    @ApiProperty({ description: "le password" , example: "hello123"})
    @IsString()
    password: string;

    @IsOptional()
    @IsEnum(UserRoleEnum)
    role?: UserRoleEnum;
    
}
