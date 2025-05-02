import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1746216697182 implements MigrationInterface {
    name = ' $npmConfigName1746216697182'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_b7d7d44e0e33834351af221757d"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "REL_b7d7d44e0e33834351af221757"`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_b7d7d44e0e33834351af221757d" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_b7d7d44e0e33834351af221757d"`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "REL_b7d7d44e0e33834351af221757" UNIQUE ("categoryId")`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_b7d7d44e0e33834351af221757d" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
