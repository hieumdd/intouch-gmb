import dayjs from 'dayjs';

import { load } from '../../bigquery/bigquery.service';
import { getAuthClient } from '../auth/auth.service';
import { getLocations } from '../location/location.service';
import { getInsights } from '../insight/insight.service';
import { getReviews } from '../review/review.service';
import { locationSchema, insightSchema, reviewSchema } from './pipeline.schema';

export type RunPipelinesOptions = {
    start: string;
    end: string;
};

export const runPipelines = async ({ start, end }: RunPipelinesOptions) => {
    const client = await getAuthClient();

    const runPipeline = async (accountId: string) => {
        const locations = await getLocations(client, { accountId });

        const insights = await Promise.all(
            locations.map(({ name }) => {
                const [_, locationId] = name.split('/');

                return getInsights(client, { locationId, start: dayjs(start), end: dayjs(end) });
            }),
        ).then((data) => data.flat());

        const reviews = await Promise.all(
            locations.map((location) => {
                return getReviews(client, { accountId, locationId: location.name });
            }),
        ).then((locationReviews) => locationReviews.flat());

        return Promise.all([
            load(locations, { table: `Location__${accountId}`, schema: locationSchema }),
            load(insights, { table: `Insight__${accountId}`, schema: insightSchema }),
            load(reviews, { table: `Review__${accountId}`, schema: reviewSchema }),
        ]).then(() => ({
            location: locations.length,
            insight: insights.length,
            review: reviews.length,
        }));
    };

    return Promise.all(
        ['108405109682017952426', '107962161788712140767'].map((accountId) => {
            return runPipeline(accountId);
        }),
    );
};
