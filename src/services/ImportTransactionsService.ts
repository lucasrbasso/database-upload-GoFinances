import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';

class ImportTransactionsService {
    async execute(transactionsFileName: string): Promise<Transaction[]> {
        const csvFilePath = path.join(
            uploadConfig.directory,
            transactionsFileName,
        );

        const transactions = getRepository(Transaction);

        const readCSVStream = fs.createReadStream(csvFilePath);

        const parseStream = csvParse({
            from_line: 2,
            ltrim: true,
            rtrim: true,
        });

        const parseCSV = readCSVStream.pipe(parseStream);

        const lines: Transaction[] = [];

        parseCSV.on('data', line => {
            lines.push(line);
        });

        await new Promise(resolve => {
            parseCSV.on('end', resolve);
        });

        const transaction = transactions.create(lines);

        await fs.promises.unlink(filePath);

        return lines;
    }
}

export default ImportTransactionsService;
