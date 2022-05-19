import { Column, Entity } from 'typeorm';
import { ConfigSubjectType } from '../config-subject-type.enum';

@Entity()
export class Config {
  @Column({ type: 'varchar', primary: true })
  module!: string;

  @Column({ type: 'enum', enum: ConfigSubjectType, primary: true })
  subjectType!: ConfigSubjectType;

  @Column({ type: 'bigint', nullable: true, primary: true })
  subject?: number;

  @Column({ type: 'json' })
  data!: any;
}
