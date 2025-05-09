import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1746782026855 implements MigrationInterface {
    name = ' $npmConfigName1746782026855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "profilePicture" character varying DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profilePicture"`);
    }

}
