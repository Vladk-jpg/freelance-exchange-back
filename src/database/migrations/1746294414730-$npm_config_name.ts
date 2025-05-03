import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1746294414730 implements MigrationInterface {
    name = ' $npmConfigName1746294414730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proposals" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proposals" DROP COLUMN "createdAt"`);
    }

}
