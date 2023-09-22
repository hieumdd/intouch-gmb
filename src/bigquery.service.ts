import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import ndjson from 'ndjson';
import { BigQuery, TableSchema } from '@google-cloud/bigquery';

import { logger } from './logging.service';
import dayjs from './dayjs';

const client = new BigQuery();

const DATASET = 'GoogleMyBusiness';

type LoadOptions = {
    table: string;
    schema: Record<string, any>[];
};

export const load = (rows: Record<string, any>[], options: LoadOptions) => {
    const tableWriteStream = client
        .dataset(DATASET)
        .table(`p_${options.table}`)
        .createWriteStream({
            schema: {
                fields: [...options.schema, { name: '_batched_at', type: 'TIMESTAMP' }],
            } as TableSchema,
            sourceFormat: 'NEWLINE_DELIMITED_JSON',
            createDisposition: 'CREATE_IF_NEEDED',
            writeDisposition: 'WRITE_APPEND',
        })
        .on('job', () => logger.debug({ fn: 'load', ...options }));

    return pipeline(
        Readable.from(rows.map((row) => ({ ...row, _batched_at: dayjs().toISOString() }))),
        ndjson.stringify(),
        tableWriteStream,
    );
};

type InsertOptions = {
    table: string;
    schema: Record<string, any>[];
};

export const insert = (rows: Record<string, any>[], options: InsertOptions) => {
    return client
        .dataset(DATASET)
        .table(`p_${options.table}`)
        .insert(
            rows.map((row) => ({ ...row, _batched_at: dayjs().toISOString() })),
            { schema: [...options.schema, { name: '_batched_at', type: 'TIMESTAMP' }] },
        );
};
