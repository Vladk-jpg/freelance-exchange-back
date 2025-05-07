import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1746646756078 implements MigrationInterface {
    name = ' $npmConfigName1746646756078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "projectId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "commission" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "commission" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "projectId"`);
    }

}
