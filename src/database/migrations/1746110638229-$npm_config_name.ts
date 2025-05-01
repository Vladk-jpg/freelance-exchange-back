import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1746110638229 implements MigrationInterface {
    name = ' $npmConfigName1746110638229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "proposals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" text NOT NULL, "status" text NOT NULL DEFAULT 'PENDING', "projectId" uuid, "freelancerId" uuid, CONSTRAINT "PK_db524c8db8e126a38a2f16d8cac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" character varying(255) NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "descriprion" text NOT NULL, "price" numeric(10,2) NOT NULL, "status" text NOT NULL DEFAULT 'CREATED', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" uuid, "clientId" uuid, "freelancerId" uuid, CONSTRAINT "REL_b7d7d44e0e33834351af221757" UNIQUE ("categoryId"), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "comment" text NOT NULL, "rating" integer NOT NULL, "senderId" uuid NOT NULL, "recepientId" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "balance" numeric(10,2) NOT NULL, "userId" uuid, CONSTRAINT "REL_2ecdb33f23e9a6fc392025c0b9" UNIQUE ("userId"), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "senderId" uuid NOT NULL, "recepientId" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "commission" numeric(3,1) NOT NULL, "status" text NOT NULL DEFAULT 'RESERVED', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" text NOT NULL DEFAULT 'CLIENT'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "status" text NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "walletId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_0a95e6aab86ff1b0278c18cf48e" UNIQUE ("walletId")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD CONSTRAINT "FK_d9184f05fdd28bd7c960d9a7e40" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "proposals" ADD CONSTRAINT "FK_219edc10f7e4cc15dd19ea5d36d" FOREIGN KEY ("freelancerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_b7d7d44e0e33834351af221757d" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_091f9433895a53408cb8ae3864f" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_22f434063fa3502539bab88858d" FOREIGN KEY ("freelancerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_3d62db8ff31a5dcb78e4492bfb9" FOREIGN KEY ("recepientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_0a95e6aab86ff1b0278c18cf48e" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_0a95e6aab86ff1b0278c18cf48e"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_3d62db8ff31a5dcb78e4492bfb9"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_22f434063fa3502539bab88858d"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_091f9433895a53408cb8ae3864f"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_b7d7d44e0e33834351af221757d"`);
        await queryRunner.query(`ALTER TABLE "proposals" DROP CONSTRAINT "FK_219edc10f7e4cc15dd19ea5d36d"`);
        await queryRunner.query(`ALTER TABLE "proposals" DROP CONSTRAINT "FK_d9184f05fdd28bd7c960d9a7e40"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_0a95e6aab86ff1b0278c18cf48e"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "walletId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "proposals"`);
    }

}
