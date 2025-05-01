import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1746037984589 implements MigrationInterface {
    name = ' $npmConfigName1746037984589'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "password" TO "passwordHash"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password"`);
    }

}
