import { getInsights } from './insight.service';
import { getClient } from '../auth/auth.service';

it('getInsights', async () => {
    const client = await getClient('intouchvet1@gmail.com');

    return getInsights(client, { locationId: '9819420616193399205' })
        .then((insights) => expect(insights).toBeDefined())
        .catch((error) => {
            console.error(error);
            throw error;
        });
});
