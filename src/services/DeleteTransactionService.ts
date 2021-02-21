import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
    public async execute(id: string): Promise<void> {
        const transactions = getCustomRepository(TransactionsRepository);

        const transaction = await transactions.findOne(id);

        if (!transaction) {
            throw new AppError('Transaction not found!', 400);
        }

        await transactions.remove(transaction);
    }
}

export default DeleteTransactionService;
