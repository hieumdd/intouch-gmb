import { getClient } from '../auth/auth.service';
import { getReviews } from './review.service';

it('getReviews', async () => {
    const businessId = 'intouchvet1@gmail.com';
    const client = await getClient(businessId);

    return await getReviews(client, { accountId: '103230759713401946828', locationId: '3043323987269608726' })
        .then((reviews) => expect(reviews).toBeDefined())
        .catch((error) => {
            console.error(error);
            throw error;
        });
});
