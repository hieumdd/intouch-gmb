import { locationPipeline, insightPipeline, reviewPipeline } from './pipeline.service';

describe('pipeline', () => {
    it('pipeline/location', async () => {
        const options = { start: '2023-01-01', end: '2024-01-01' };

        return locationPipeline(options)
            .then((result) => {
                expect(result).toBeGreaterThanOrEqual(0);
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    });

    it('pipeline/insight', async () => {
        const options = {
            accountId: '108405109682017952426',
            locationId: '16151841337430804192',
            start: '2023-01-01',
            end: '2024-01-01',
        };

        return insightPipeline(options)
            .then((result) => {
                expect(result).toBeGreaterThanOrEqual(0);
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    });

    it('pipeline/review', async () => {
        const options = {
            accountId: '108405109682017952426',
            locationId: 'locations/16151841337430804192',
        };

        return reviewPipeline(options)
            .then((result) => {
                expect(result).toBeGreaterThanOrEqual(0);
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    });
});
