import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1748095333739 implements MigrationInterface {
    name = ' $npmConfigName1748095333739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "commission" SET DEFAULT '10'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "commission" SET DEFAULT '0'`);
    }

}
