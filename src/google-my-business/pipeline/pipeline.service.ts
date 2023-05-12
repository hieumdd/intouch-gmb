import dayjs from 'dayjs';

import { load } from '../../bigquery/bigquery.service';
import { getAuthClient } from '../auth/auth.service';
import { getLocations } from '../location/location.service';
import { getInsights } from '../insight/insight.service';
import { getReviews } from '../review/review.service';
import { locationSchema, insightSchema, reviewSchema } from './pipeline.schema';

export const ACCOUNT_IDS = [
    '108410633950303010387',
    '110318830513658384132',
    '106229460503813799776',
    '100573566092104440301',
    '102557082445185740080',
    '113525279692964740608',
    '116319944937011819347',
    '116102622521931142940',
    '109564451008494963787',
    '108377208689430486449',
    '105349743222273578941',
    '117711380718861870899',
    '118431062178951153484',
    '115347226326702644007',
    '109713237601553973412',
    '106289254611160713633',
    '110330971716857283417',
    '113474757162097686232',
    '114773234823613337140',
    '109031214894962719165',
    '108162336638149981189',
    '104902727633726943636',
    '114540406156996221549',
    '111247570102565088769',
    '115095552779082091769',
    '118297400137675290332',
    '100257412545533878399',
    '117245270700982853551',
    '108405109682017952426',
    '101789019625300647506',
    '112149756678977647532',
    '108071160239924318608',
    '117258147294478852396',
    '116471768159485451813',
];
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
            accountId,
            location: locations.length,
            insight: insights.length,
            review: reviews.length,
        }));
    };

    return Promise.all(ACCOUNT_IDS.map((accountId) => runPipeline(accountId)));
};
