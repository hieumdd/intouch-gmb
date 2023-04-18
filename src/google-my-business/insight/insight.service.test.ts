import { AxiosInstance } from 'axios';
import dayjs from 'dayjs';

import { getAuthClient } from '../auth/auth.service';
import { getInsights } from './insight.service';

describe('insight', () => {
    let client: AxiosInstance;
    const locationId = `16151841337430804192`;

    beforeAll(async () => {
        client = await getAuthClient();
    });

    it('get-insights', async () => {
        const start = dayjs('2022-01-01');
        const end = dayjs('2023-01-01');

        return getInsights(client, { locationId, start, end })
            .then((insights) => {
                console.log(insights);
                insights.forEach((insight) => {
                    expect(insight.location_id).toBe(locationId);
                    expect(insight.date).toBeTruthy();
                });
            })
            .catch((error) => {
                console.error(error);
                return Promise.reject(error);
            });
    });
});
