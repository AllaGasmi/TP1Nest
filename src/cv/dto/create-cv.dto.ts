import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsArray, ArrayNotEmpty, IsOptional } from "class-validator";

export class CreateCvDto {
    @ApiProperty({ description: 'le nom' ,example: 'ouma'})
    @IsString()
    name: string;
    
    @ApiProperty({ description: 'le prénom' , example:'ouma'})
    @IsString()
    firstname: string;

    @ApiProperty({ description: "l'age" ,example:21})
    @IsNumber()
    age: number;
    
    @ApiProperty({ description: "le numéro de CIN" })
    @IsString()
    Cin: string;
    
    @ApiProperty({ description: "le poste" })
    @IsString()
    Job: string;
    
    @ApiProperty({ description: "le chemin de l'image" , example: 'http://localhost:3000/uploads/cv1.jpg' })
    @IsString()
    path: string;

    @ApiProperty({ description: "les identifiants des skills" , type: [Number]})
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    skillIds: number[];

    @ApiProperty({ description: "l'identifiant de l'utilisateur", type: Number})
    @IsNumber()
    userId: number;
}
