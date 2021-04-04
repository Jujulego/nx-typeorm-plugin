import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false, length: 100 })
  name: string;

  @Column('text', { nullable: false })
  description: string;

  @Column('boolean', { default: false })
  done: boolean;
}
