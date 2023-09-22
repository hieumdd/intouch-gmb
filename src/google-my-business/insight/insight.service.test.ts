import { AxiosInstance } from 'axios';
import dayjs from 'dayjs';

import { getAuthClient } from '../auth/auth.service';
import { getInsights } from './insight.service';

describe('insight', () => {
    let client: AxiosInstance;
    const locationId = `4305921192437063007`;

    beforeAll(async () => {
        client = await getAuthClient();
    });

    it('get-daily-metrics', async () => {
        const start = dayjs('2023-01-01');
        const end = dayjs('2024-01-01');

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
    
    it('get-daily-metrics', async () => {
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
