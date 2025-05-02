import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1746192535108 implements MigrationInterface {
    name = ' $npmConfigName1746192535108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "REL_2ecdb33f23e9a6fc392025c0b9"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "wallets" ALTER COLUMN "balance" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" ALTER COLUMN "balance" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "REL_2ecdb33f23e9a6fc392025c0b9" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
