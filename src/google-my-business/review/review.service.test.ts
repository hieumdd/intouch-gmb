import { AxiosInstance } from 'axios';

import { getAuthClient } from '../auth/auth.service';
import { getReviews } from './review.service';

describe('review', () => {
    let client: AxiosInstance;
    const accountId = `108405109682017952426`;
    const locationId = `locations/15985377062328992273`;

    beforeAll(async () => {
        client = await getAuthClient();
    });

    it('get-reviews', async () => {
        return getReviews(client, { accountId, location: locationId })
            .then((reviews) => {
                console.log(reviews);
                reviews.forEach((review) => {
                    expect(review).toBeTruthy();
                });
            })
            .catch((error) => {
                console.log(error);
                return Promise.reject(error);
            });
    });
});
