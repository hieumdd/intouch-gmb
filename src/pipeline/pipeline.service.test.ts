import { configs } from './account.const';
import {
    createLocationPipelines,
    runLocationPipeline,
    runInsightPipeline,
    runReviewPipeline,
} from './pipeline.service';

it('pipeline/createLocationPipelines', async () => {
    return createLocationPipelines().catch((error) => {
        console.error({ error });
        throw error;
    });
});

describe('pipeline', () => {
    let refreshToken: string;

    beforeAll(async () => {
        refreshToken = await configs[0].getRefreshToken();
    });

    it('pipeline/location', async () => {
        const options = {
            refreshToken,
            accountIds: configs[0].accountIds,
            start: '2023-01-01',
            end: '2024-01-01',
        };

        return runLocationPipeline(options)
            .then((result) => {
                expect(result).toBeGreaterThanOrEqual(0);
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    });

    it('pipeline/insight', async () => {
        const options = {
            refreshToken,
            accountId: '108405109682017952426',
            locationId: '16151841337430804192',
            start: '2023-01-01',
            end: '2024-01-01',
        };

        return runInsightPipeline(options)
            .then((result) => {
                expect(result).toBeGreaterThanOrEqual(0);
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    });

    it('pipeline/review', async () => {
        const options = {
            refreshToken,
            accountId: '108405109682017952426',
            location: 'locations/16151841337430804192',
        };

        return runReviewPipeline(options)
            .then((result) => {
                expect(result).toBeGreaterThanOrEqual(0);
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    });
});
