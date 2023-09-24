import { AxiosInstance } from 'axios';

import { configs } from '../../pipeline/account.const';
import { getAuthClient } from '../auth/auth.service';
import { getReviews } from './review.service';

describe('review', () => {
    let client: AxiosInstance;
    const config = configs[1];

    beforeAll(async () => {
        client = await config.getRefreshToken().then(getAuthClient);
    });

    it('get-reviews', async () => {
        const accountId = `108405109682017952426`;
        const locationId = `locations/15985377062328992273`;

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
