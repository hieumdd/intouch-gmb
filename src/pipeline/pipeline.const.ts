import { LoadConfig } from '../bigquery.service';

type Pipeline = {
    route: string;
    getLoadConfig: (accountId: string) => LoadConfig;
};

export const Location: Pipeline = {
    route: 'location',
    getLoadConfig: (accountId: string) => ({
        table: `p_Location__${accountId}`,
        schema: [
            { name: 'name', type: 'STRING' },
            { name: 'title', type: 'STRING' },
            { name: 'storeCode', type: 'STRING' },
            { name: 'locationId', type: 'STRING' },
            {
                name: 'storefrontAddress',
                type: 'RECORD',
                fields: [{ name: 'addressLines', type: 'STRING', mode: 'REPEATED' }],
            },
        ],
    }),
};

export const Insight: Pipeline = {
    route: 'insight',
    getLoadConfig: (accountId: string) => ({
        table: `p_Insight__${accountId}`,
        schema: [
            { name: 'location_id', type: 'STRING' },
            { name: 'metric', type: 'STRING' },
            { name: 'date', type: 'STRING' },
            { name: 'value', type: 'NUMERIC' },
        ],
    }),
};

export const Review: Pipeline = {
    route: 'review',
    getLoadConfig: (accountId: string) => ({
        table: `p_Review__${accountId}`,
        schema: [
            { name: 'reviewId', type: 'STRING' },
            {
                name: 'reviewer',
                type: 'record',
                fields: [
                    { name: 'profilePhotoUrl', type: 'STRING' },
                    { name: 'displayName', type: 'STRING' },
                ],
            },
            { name: 'starRating', type: 'STRING' },
            { name: 'comment', type: 'STRING' },
            { name: 'createTime', type: 'TIMESTAMP' },
            { name: 'updateTime', type: 'TIMESTAMP' },
            {
                name: 'reviewReply',
                type: 'record',
                fields: [
                    { name: 'comment', type: 'STRING' },
                    { name: 'updateTime', type: 'TIMESTAMP' },
                ],
            },
            { name: 'name', type: 'STRING' },
            { name: 'accountId', type: 'STRING' },
            { name: 'locationId', type: 'STRING' },
        ],
    }),
};
