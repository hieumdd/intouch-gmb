import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import ndjson from 'ndjson';
import { BigQuery, TableSchema } from '@google-cloud/bigquery';

import { logger } from './logging.service';
import dayjs from './dayjs';

const client = new BigQuery();

const DATASET = 'GoogleMyBusiness';

export type LoadConfig = {
    table: string;
    schema: Record<string, any>[];
};

export const load = (rows: Record<string, any>[], { table, schema }: LoadConfig) => {
    const tableWriteStream = client
        .dataset(DATASET)
        .table(table)
        .createWriteStream({
            schema: {
                fields: [...schema, { name: '_batched_at', type: 'TIMESTAMP' }],
            } as TableSchema,
            sourceFormat: 'NEWLINE_DELIMITED_JSON',
            createDisposition: 'CREATE_IF_NEEDED',
            writeDisposition: 'WRITE_APPEND',
        })
        .on('job', () => logger.debug({ fn: 'load', table }));

    return pipeline(
        Readable.from(rows.map((row) => ({ ...row, _batched_at: dayjs().toISOString() }))),
        ndjson.stringify(),
        tableWriteStream,
    );
};

export const insert = (rows: Record<string, any>[], { table, schema }: LoadConfig) => {
    return client
        .dataset(DATASET)
        .table(table)
        .insert(
            rows.map((row) => ({ ...row, _batched_at: dayjs().toISOString() })),
            { schema: [...schema, { name: '_batched_at', type: 'TIMESTAMP' }] },
        );
};
