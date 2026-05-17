import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema2026051700000 implements MigrationInterface {
  name = 'InitialSchema2026051700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "first_name" character varying(55) NOT NULL,
        "last_name" character varying(55) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "providers" (
        "id" SERIAL NOT NULL,
        "users_id" integer,
        CONSTRAINT "UQ_providers_users_id" UNIQUE ("users_id"),
        CONSTRAINT "PK_providers_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" SERIAL NOT NULL,
        "company" character varying(100),
        "identifier" character varying(20),
        "users_id" integer,
        "providers_id" integer,
        CONSTRAINT "UQ_customers_identifier" UNIQUE ("identifier"),
        CONSTRAINT "UQ_customers_users_id" UNIQUE ("users_id"),
        CONSTRAINT "PK_customers_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "assignments" (
        "id" SERIAL NOT NULL,
        "hourly_rate" numeric(10,2) NOT NULL,
        "budget" numeric(10,2) NOT NULL,
        "label" text,
        "providers_id" integer NOT NULL,
        "customers_id" integer NOT NULL,
        CONSTRAINT "PK_assignments_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "activity_reports" (
        "id" SERIAL NOT NULL,
        "month" integer NOT NULL,
        "year" integer NOT NULL,
        "providers_id" integer NOT NULL,
        "assignments_id" integer,
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "assignment_ids" text,
        CONSTRAINT "PK_activity_reports_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "activity_reports_costs" (
        "id" SERIAL NOT NULL,
        "activity_reports_id" integer NOT NULL,
        "label" text NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "category" text NOT NULL,
        CONSTRAINT "PK_activity_reports_costs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "activity_reports_lines" (
        "id" SERIAL NOT NULL,
        "day" integer NOT NULL,
        "past_day" double precision NOT NULL,
        "activity_reports_id" integer NOT NULL,
        "assignments_id" integer NOT NULL,
        CONSTRAINT "PK_activity_reports_lines_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "providers"
      ADD CONSTRAINT "FK_providers_users_id"
      FOREIGN KEY ("users_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "customers"
      ADD CONSTRAINT "FK_customers_users_id"
      FOREIGN KEY ("users_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "customers"
      ADD CONSTRAINT "FK_customers_providers_id"
      FOREIGN KEY ("providers_id") REFERENCES "providers"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "assignments"
      ADD CONSTRAINT "FK_assignments_providers_id"
      FOREIGN KEY ("providers_id") REFERENCES "providers"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "assignments"
      ADD CONSTRAINT "FK_assignments_customers_id"
      FOREIGN KEY ("customers_id") REFERENCES "customers"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "activity_reports"
      ADD CONSTRAINT "FK_activity_reports_providers_id"
      FOREIGN KEY ("providers_id") REFERENCES "providers"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "activity_reports"
      ADD CONSTRAINT "FK_activity_reports_assignments_id"
      FOREIGN KEY ("assignments_id") REFERENCES "assignments"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "activity_reports_costs"
      ADD CONSTRAINT "FK_activity_reports_costs_activity_reports_id"
      FOREIGN KEY ("activity_reports_id") REFERENCES "activity_reports"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "activity_reports_lines"
      ADD CONSTRAINT "FK_activity_reports_lines_activity_reports_id"
      FOREIGN KEY ("activity_reports_id") REFERENCES "activity_reports"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "activity_reports_lines"
      ADD CONSTRAINT "FK_activity_reports_lines_assignments_id"
      FOREIGN KEY ("assignments_id") REFERENCES "assignments"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "activity_reports_lines" DROP CONSTRAINT "FK_activity_reports_lines_assignments_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "activity_reports_lines" DROP CONSTRAINT "FK_activity_reports_lines_activity_reports_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "activity_reports_costs" DROP CONSTRAINT "FK_activity_reports_costs_activity_reports_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "activity_reports" DROP CONSTRAINT "FK_activity_reports_assignments_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "activity_reports" DROP CONSTRAINT "FK_activity_reports_providers_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "assignments" DROP CONSTRAINT "FK_assignments_customers_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "assignments" DROP CONSTRAINT "FK_assignments_providers_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "customers" DROP CONSTRAINT "FK_customers_providers_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "customers" DROP CONSTRAINT "FK_customers_users_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "providers" DROP CONSTRAINT "FK_providers_users_id"',
    );

    await queryRunner.query('DROP TABLE "activity_reports_lines"');
    await queryRunner.query('DROP TABLE "activity_reports_costs"');
    await queryRunner.query('DROP TABLE "activity_reports"');
    await queryRunner.query('DROP TABLE "assignments"');
    await queryRunner.query('DROP TABLE "customers"');
    await queryRunner.query('DROP TABLE "providers"');
    await queryRunner.query('DROP TABLE "users"');
  }
}
