import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1746033802997 implements MigrationInterface {
    name = ' $npmConfigName1746033802997'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "name" TO "username"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "username" TO "name"`);
    }

}
