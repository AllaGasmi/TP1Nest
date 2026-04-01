import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateSkillDto {

    @ApiProperty({description: "la désignation de votre skill", example: "nestJs"})
    @IsString()
    designation: string;
}
