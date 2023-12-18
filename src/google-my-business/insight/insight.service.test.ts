import { getInsights } from './insight.service';
import { getClient } from '../auth/auth.service';

it('getInsights', async () => {
    const client = await getClient('intouchvet1@gmail.com');

    return await getInsights(client, { locationId: '3043323987269608726' })
        .then((insights) => expect(insights).toBeDefined())
        .catch((error) => {
            console.error(error);
            throw error;
        });
});
