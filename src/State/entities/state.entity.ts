import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({name: 'State'})
export class State {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

   
}
