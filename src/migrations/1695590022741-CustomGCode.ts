import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomGCode1695590022741 implements MigrationInterface {
    name = 'CustomGCode1695590022741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "custom_g_code" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar,
                "gcode" text NOT NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "custom_g_code"
        `);
    }

}
