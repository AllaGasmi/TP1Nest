import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn } from "class-validator";

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
    
    @ApiProperty({ description: "user role", example: "user", enum: ["user", "admin"], required: false })
    @IsOptional()
    @IsIn(["user", "admin"])
    role?: 'admin' | 'user';
    
}
