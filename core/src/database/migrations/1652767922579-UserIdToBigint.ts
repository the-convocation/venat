import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserIdToBigint1652767922579 implements MigrationInterface {
  name = 'UserIdToBigint1652767922579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user"
            ALTER COLUMN "id" TYPE BIGINT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user"
            ALTER COLUMN "id" TYPE INTEGER;
    `);
  }
}
