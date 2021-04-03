import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Person {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false, length: 250 })
  firstName: string;

  @Column('varchar', { nullable: false, length: 250 })
  lastName: string;
}
