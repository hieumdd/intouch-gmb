import { v4 as uuid4 } from 'uuid';

import { oauth2Client } from '../google-my-business/auth/auth.service';
import dayjs from '../dayjs';
import { insert, load } from '../bigquery.service';
import { createTask } from '../cloud-tasks.service';
import { configs } from './account.const';
import { getAuthClient, ensureToken } from '../google-my-business/auth/auth.service';
import { getLocations } from '../google-my-business/location/location.service';
import { getInsights } from '../google-my-business/insight/insight.service';
import { getReviews } from '../google-my-business/review/review.service';
import * as pipelines from './pipeline.const';
import { getAll } from '../google-my-business/business/business.repository';
import { getAccounts } from '../google-my-business/account/account.service';

export const initiatePipelines = async () => {
    const businessSnapshots = await getAll();

    return await Promise.all(
        businessSnapshots.map(async ({ id: businessId }) => {
            await ensureToken(businessId);
            const accounts = await getAccounts();

            return await Promise.all(
                accounts.map(async ({ accountId }) => {
                    const locations = await getLocations(oauth2Client, { accountId });

                    const taskPromises = locations.flatMap(({ locationId }) => {
                        return [
                            createTask(
                                pipelines.Insight.route,
                                { businessId, accountId, locationId, start: '', end: '' },
                                () => pipelines.Insight.route,
                            ),
                            createTask(
                                pipelines.Review.route,
                                { businessId, accountId, locationId },
                                () => pipelines.Review.route,
                            ),
                        ];
                    });

                    return [...taskPromises, load(locations, pipelines.Location.getLoadConfig(accountId))];
                }),
            ).then((promises) => promises.flat());
        }),
    )
        .then((promises) => Promise.all(promises.flat()))
        .then(() => true);
};

export const createLocationPipelines = async () => {
    return Promise.all(
        configs.map(async (config) => {
            const refreshToken = await config.getRefreshToken();

            return createTask(
                pipelines.Location.route,
                { refreshToken, accountIds: config.accountIds },
                () => `${pipelines.Location.route}-${uuid4()}`,
            );
        }),
    ).then(() => true);
};
export type RunLocationPipelineOptions = {
    refreshToken: string;
    accountIds: string[];
    start: string;
    end: string;
};

export const runLocationPipeline = async (options: RunLocationPipelineOptions) => {
    const { refreshToken, accountIds, start, end } = options;

    const client = await getAuthClient(refreshToken);

    return Promise.all(
        accountIds.flatMap(async (accountId) => {
            const locations = await getLocations(oauth2Client, { accountId });

            const createTasksPromise = [
                ...locations.map(({ name }) => {
                    const [_, locationId] = name.split('/');
                    return createTask(
                        pipelines.Insight.route,
                        { refreshToken, accountId, locationId, start, end },
                        ({ accountId, locationId }) => {
                            return [pipelines.Insight.route, accountId, locationId].join('-');
                        },
                    );
                }),
                ...locations.map(({ name: location }) => {
                    return createTask(
                        pipelines.Review.route,
                        { refreshToken, accountId, location },
                        ({ accountId, location }) => {
                            const [_, locationId] = location.split('/');
                            return [pipelines.Review.route, accountId, locationId].join('-');
                        },
                    );
                }),
            ];

            return [locations, ...createTasksPromise, load(locations, pipelines.Location.getLoadConfig(accountId))];
        }),
    ).then(([locations]) => locations.length);
};

export type RunInsightPipelineOptions = {
    refreshToken: string;
    accountId: string;
    locationId: string;
    start: string;
    end: string;
};

export const runInsightPipeline = async (options: RunInsightPipelineOptions) => {
    const { refreshToken, accountId, locationId, start, end } = options;

    const client = await getAuthClient(refreshToken);

    const insights = await getInsights(client, {
        locationId,
        start: dayjs(start),
        end: dayjs(end),
    });

    return insights.length > 0
        ? insert(insights, pipelines.Insight.getLoadConfig(accountId)).then(() => insights.length)
        : 0;
};

export type RunReviewPipelineOptions = {
    refreshToken: string;
    accountId: string;
    location: string;
};

export const runReviewPipeline = async (options: RunReviewPipelineOptions) => {
    const { refreshToken, accountId, location } = options;

    const client = await getAuthClient(refreshToken);

    const reviews = await getReviews(client, { accountId, location });

    return reviews.length > 0
        ? insert(reviews, pipelines.Review.getLoadConfig(accountId)).then(() => reviews.length)
        : 0;
};
