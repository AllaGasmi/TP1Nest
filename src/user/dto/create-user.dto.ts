import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ description: "le username" , example: "ouma" })
    @IsString()
    username!: string;
    @ApiProperty({ description: "l'email" , example: "ouma@gmail.com"})
    @IsString()
    email!: string;
    
    @ApiProperty({ description: "le password" , example: "hello123"})
    @IsString()
    password!: string;
    
    @ApiProperty({ description: "l'âge" , example: 25 })
    @IsNumber()
    age!: number;
    
}
