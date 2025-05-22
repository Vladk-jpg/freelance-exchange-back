import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1747035727097 implements MigrationInterface {
    name = ' $npmConfigName1747035727097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" RENAME COLUMN "descriprion" TO "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" RENAME COLUMN "description" TO "descriprion"`);
    }

}
