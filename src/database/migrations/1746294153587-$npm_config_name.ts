import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1746294153587 implements MigrationInterface {
    name = ' $npmConfigName1746294153587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "createdAt"`);
    }

}
