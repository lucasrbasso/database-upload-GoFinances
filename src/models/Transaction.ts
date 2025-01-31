/* eslint-disable camelcase */
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import Category from './Category';

@Entity('transactions')
class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    value: number;

    @Column()
    type: string;

    @Column()
    category_id: string;

    @ManyToOne(() => Category)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @CreateDateColumn()
    created_at: Date;

    @CreateDateColumn()
    updated_at: Date;
}

export default Transaction;
