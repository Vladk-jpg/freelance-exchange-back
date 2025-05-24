import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1748101202736 implements MigrationInterface {
    name = ' $npmConfigName1748101202736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" ADD "projectId" uuid`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "UQ_ee90086bb783380da5453d240b9" UNIQUE ("projectId")`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_ee90086bb783380da5453d240b9" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_ee90086bb783380da5453d240b9"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "UQ_ee90086bb783380da5453d240b9"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "projectId"`);
    }

}
