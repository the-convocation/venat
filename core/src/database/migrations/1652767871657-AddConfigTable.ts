import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfigTable1652767871657 implements MigrationInterface {
  name = 'AddConfigTable1652767871657';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."config_subjecttype_enum" AS ENUM('global', 'guild', 'user')
        `);
    await queryRunner.query(`
        CREATE TABLE "config"
        (
            "module"      character varying                  NOT NULL,
            "subjectType" "public"."config_subjecttype_enum" NOT NULL,
            "subject"     bigint,
            "data"        json                               NOT NULL,
            CONSTRAINT "PK_d50d2aaa485df164403875b9448" PRIMARY KEY ("module", "subjectType", "subject")
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "config"
    `);
    await queryRunner.query(`
            DROP TYPE "public"."config_subjecttype_enum"
        `);
  }
}
