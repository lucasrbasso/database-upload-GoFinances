import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
    title: string;
    value: number;
    type: string;
    category: string;
}
class CreateTransactionService {
    public async execute({
        title,
        value,
        type,
        category,
    }: Request): Promise<Transaction> {
        const categories = getRepository(Category);
        const transactions = getCustomRepository(TransactionsRepository);

        const balance = await transactions.getBalance();

        if (!category || !value || !title) {
            throw new AppError('Missing information', 400);
        }

        if (!['income', 'outcome'].includes(type)) {
            throw new AppError('Transaction type invalid', 400);
        }

        if (type === 'outcome' && balance.total - value < 0) {
            throw new AppError('There is not enough balance', 400);
        }

        const checkCategoryExists = await categories.findOne({
            where: { title: category },
        });

        if (!checkCategoryExists) {
            const newCategory = categories.create({
                title: category,
            });

            await categories.save(newCategory);

            const repository = transactions.create({
                title,
                value,
                type,
                category_id: newCategory.id,
            });

            await transactions.save(repository);
            return repository;
        }

        const repository = transactions.create({
            title,
            value,
            type,
            category_id: checkCategoryExists.id,
        });

        await transactions.save(repository);

        return repository;
    }
}

export default CreateTransactionService;
