import dayjs from 'dayjs';

import { insert, load } from '../bigquery.service';
import { createTask } from '../cloud-tasks.service';
import { getAuthClient } from '../google-my-business/auth/auth.service';
import { getLocations } from '../google-my-business/location/location.service';
import { getInsights } from '../google-my-business/insight/insight.service';
import { getReviews } from '../google-my-business/review/review.service';
import { locationSchema, insightSchema, reviewSchema } from './pipeline.schema';
import { INSIGHT_ROUTE, REVIEW_ROUTE } from '../route.const';

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

export type LocationPipelineOptions = {
    start: string;
    end: string;
};

export const locationPipeline = async ({ start, end }: LocationPipelineOptions) => {
    const client = await getAuthClient();

    return Promise.all(
        ACCOUNT_IDS.map(async (accountId) => {
            const locations = await getLocations(client, { accountId });

            const createTasksPromise = [
                ...locations.map(({ name }) => {
                    const [_, locationId] = name.split('/');
                    return createTask(
                        INSIGHT_ROUTE,
                        { accountId, locationId, start, end },
                        ({ accountId, locationId }) => ['INSIGHT', accountId, locationId].join('-'),
                    );
                }),
                ...locations.map(({ name: location }) => {
                    return createTask(
                        REVIEW_ROUTE,
                        { accountId, location },
                        ({ accountId, location }) => {
                            const [_, locationId] = location.split('/');
                            return ['REVIEW', accountId, locationId].join('-');
                        },
                    );
                }),
            ];

            return [
                locations,
                createTasksPromise,
                load(locations, { table: `Location__${accountId}`, schema: locationSchema }),
            ];
        }),
    ).then(([locations]) => locations.length);
};

export type InsightPipelineOptions = {
    accountId: string;
    locationId: string;
    start: string;
    end: string;
};

export const insightPipeline = async (options: InsightPipelineOptions) => {
    const { accountId, locationId, start, end } = options;

    const client = await getAuthClient();

    const insights = await getInsights(client, {
        locationId,
        start: dayjs(start),
        end: dayjs(end),
    });

    return insights.length > 0
        ? insert(insights, { table: `Insight__${accountId}`, schema: insightSchema }).then(
              () => insights.length,
          )
        : 0;
};

export type ReviewPipelineOptions = {
    accountId: string;
    location: string;
};

export const reviewPipeline = async ({ accountId, location }: ReviewPipelineOptions) => {
    const client = await getAuthClient();

    const reviews = await getReviews(client, { accountId, location });

    return reviews.length > 0
        ? insert(reviews, { table: `Review__${accountId}`, schema: reviewSchema }).then(
              () => reviews.length,
          )
        : 0;
};
