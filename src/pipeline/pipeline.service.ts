import dayjs from '../dayjs';
import { insert, load } from '../bigquery.service';
import { createTask } from '../cloud-tasks.service';
import { getClient } from '../google-my-business/auth/auth.service';
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
            const client = await getClient(businessId);
            const accounts = await getAccounts(client);

            return await Promise.all(
                accounts.map(async ({ accountId }) => {
                    const locations = await getLocations(client, { accountId });

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

export type RunInsightPipelineOptions = {
    businessId: string;
    accountId: string;
    locationId: string;
};

export const runInsightPipeline = async (options: RunInsightPipelineOptions) => {
    const { businessId, accountId, locationId } = options;

    const client = await getClient(businessId);
    const insights = await getInsights(client, { locationId });

    return insights.length > 0
        ? insert(insights, pipelines.Insight.getLoadConfig(accountId)).then(() => insights.length)
        : 0;
};

export type RunReviewPipelineOptions = {
    businessId: string;
    accountId: string;
    locationId: string;
};

export const runReviewPipeline = async (options: RunReviewPipelineOptions) => {
    const { businessId, accountId, locationId } = options;

    const client = await getClient(businessId);
    const reviews = await getReviews(client, { accountId, locationId });

    return reviews.length > 0
        ? insert(reviews, pipelines.Review.getLoadConfig(accountId)).then(() => reviews.length)
        : 0;
};
