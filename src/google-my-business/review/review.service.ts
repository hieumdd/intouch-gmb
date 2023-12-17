import { OAuth2Client } from 'google-auth-library';
import { GaxiosError } from 'gaxios';

import { logger } from '../../logging.service';
import { Review } from './review.type';

type GetReviewsOptions = {
    accountId: string;
    locationId: string;
};

export const getReviews = async (client: OAuth2Client, options: GetReviewsOptions) => {
    const { accountId, locationId } = options;

    const _get = async (pageToken?: string): Promise<Review[]> => {
        const { reviews, nextPageToken } = await client
            .request<{ reviews: Review[]; nextPageToken?: string }>({
                method: 'GET',
                url: `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`,
                params: { pageToken },
            })
            .then((response) => response.data)
            .catch((error) => {
                if (error instanceof GaxiosError && error.status === 403) {
                    logger.warn({ fn: 'getInsights', status: error.status, locationId });
                    return { reviews: [], nextPageToken: undefined };
                }
                throw error;
            });

        return nextPageToken ? [...reviews, ...(await _get(nextPageToken))] : reviews || [];
    };

    return await _get().then((rows) => (rows || []).map((row) => ({ ...row, accountId, locationId })));
};
