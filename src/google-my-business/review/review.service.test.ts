import { getClient } from '../auth/auth.service';
import { getReviews } from './review.service';

it('getReviews', async () => {
    const accountId = 'intouchvet1@gmail.com';
    const client = await getClient(accountId);

    return getReviews(client, { accountId, locationId: '9819420616193399205' })
        .then((insights) => expect(insights).toBeDefined())
        .catch((error) => {
            console.error(error);
            throw error;
        });
});
