/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class Migration1762853894080 {
    name = 'Migration1762853894080'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "age" integer,
                "bio" character varying,
                "address" character varying,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "photos" (
                "id" SERIAL NOT NULL,
                "path" character varying NOT NULL,
                "userId" integer,
                CONSTRAINT "PK_5220c45b8e32d49d767b9b3d725" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "photos"
            ADD CONSTRAINT "FK_74da4f305b050f7d27c73b04263" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "photos" DROP CONSTRAINT "FK_74da4f305b050f7d27c73b04263"
        `);
        await queryRunner.query(`
            DROP TABLE "photos"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }
}
