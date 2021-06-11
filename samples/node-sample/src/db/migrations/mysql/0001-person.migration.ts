import { MigrationInterface, QueryRunner } from 'typeorm';

export class Person0001Migration implements MigrationInterface {
  name = 'Person1623451348623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `person` (`id` varchar(36) NOT NULL, `firstName` varchar(250) NOT NULL, `lastName` varchar(250) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `person`');
  }
}
