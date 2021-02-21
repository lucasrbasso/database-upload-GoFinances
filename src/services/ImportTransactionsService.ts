import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import { getCustomRepository, getRepository, In } from 'typeorm';

import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
    title: string;
    value: number;
    type: string;
    category: string;
}

class ImportTransactionsService {
    async execute(transactionsFileName: string): Promise<Transaction[]> {
        const csvFilePath = path.join(
            uploadConfig.directory,
            transactionsFileName,
        );

        const transactionsRepository = getCustomRepository(
            TransactionsRepository,
        );
        const categoryRepository = getRepository(Category);

        const readCSVStream = fs.createReadStream(csvFilePath);

        const parseStream = csvParse({
            from_line: 2,
            ltrim: true,
            rtrim: true,
        });

        const parseCSV = readCSVStream.pipe(parseStream);

        const transactions: Request[] = [];
        const categories: string[] = [];

        parseCSV.on('data', async line => {
            const [title, type, value, category] = line.map((cell: string) => {
                return cell.trim();
            });

            if (!title || !type || !value) {
                return;
            }
            categories.push(category);
            transactions.push({ title, type, value, category });
        });

        await new Promise(resolve => parseCSV.on('end', resolve));

        const existsCategories = await categoryRepository.find({
            where: In(categories),
        });

        const existentCategorioesTitle = existsCategories.map(
            category => category.title,
        );

        const addCategoryTitles = categories
            .filter(category => !existentCategorioesTitle.includes(category))
            .filter((value, index, self) => self.indexOf(value) === index);

        const newCategories = categoryRepository.create(
            addCategoryTitles.map(title => ({
                title,
            })),
        );

        await categoryRepository.save(newCategories);

        const finalCategories = [...existsCategories, ...newCategories];

        const createdTransactions = transactionsRepository.create(
            transactions.map(transaction => ({
                title: transaction.title,
                type: transaction.type,
                value: transaction.value,
                category: finalCategories.find(
                    category => category.title === transaction.category,
                ),
            })),
        );

        await transactionsRepository.save(createdTransactions);

        await fs.promises.unlink(csvFilePath);

        return createdTransactions;
    }
}

export default ImportTransactionsService;
