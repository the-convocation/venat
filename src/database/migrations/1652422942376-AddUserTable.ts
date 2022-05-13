import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTable1652422942376 implements MigrationInterface {
  name = 'AddUserTable1652422942376';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "user"
        (
            "id"       integer NOT NULL,
            "isAdmin"  boolean NOT NULL,
            "isBanned" boolean NOT NULL,
            CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "user"
    `);
  }
}
