import { insert, load } from '../bigquery.service';
import { createTask } from '../cloud-tasks.service';
import { getClient } from '../google-my-business/auth/auth.service';
import { getAll } from '../google-my-business/business/business.repository';
import { getAccounts } from '../google-my-business/account/account.service';
import { getLocations } from '../google-my-business/location/location.service';
import { getInsights } from '../google-my-business/insight/insight.service';
import { getReviews } from '../google-my-business/review/review.service';
import * as pipelines from './pipeline.const';

export const initiatePipelines = async () => {
    const businessSnapshots = await getAll();

    return await Promise.all(
        businessSnapshots.map(async ({ id: businessId }) => {
            const client = await getClient(businessId);
            const accounts = await getAccounts(client);

            return await Promise.all(
                accounts.map(async ({ accountId }) => {
                    const locations = await getLocations(client, { accountId });

                    const taskPromises = locations.map(({ locationId }) => {
                        return createTask(
                            pipelines.Location.route,
                            { businessId, accountId, locationId },
                            () => pipelines.Location.route,
                        );
                    });

                    return [...taskPromises, load(locations, pipelines.Location.getLoadConfig(accountId))];
                }),
            ).then((promises) => promises.flat());
        }),
    )
        .then((promises) => Promise.all(promises.flat()))
        .then(() => true);
};

export type RunLocationPipelineOptions = {
    businessId: string;
    accountId: string;
    locationId: string;
};

export const runLocationPipeline = async (options: RunLocationPipelineOptions) => {
    const { businessId, accountId, locationId } = options;

    const client = await getClient(businessId);

    return await Promise.all([
        getInsights(client, { locationId }).then((insights) => {
            return insights.length > 0
                ? insert(insights, pipelines.Insight.getLoadConfig(accountId)).then(() => insights.length)
                : 0;
        }),
        getReviews(client, { accountId, locationId }).then((reviews) => {
            return reviews.length > 0
                ? insert(reviews, pipelines.Review.getLoadConfig(accountId)).then(() => reviews.length)
                : 0;
        }),
    ]);
};
