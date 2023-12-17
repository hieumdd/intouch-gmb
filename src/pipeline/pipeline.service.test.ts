import { runLocationPipeline, initiatePipelines } from './pipeline.service';

it('initiatePipelines', async () => {
    return initiatePipelines().catch((error) => {
        console.error(error);
        throw error;
    });
});

it('pipeline/location', async () => {
    const options = {
        businessId: 'intouchvet1@gmail.com',
        accountId: '102424011136800668773',
        locationId: '9819420616193399205',
    };

    return runLocationPipeline(options)
        .then(([insights, reviews]) => {
            expect(insights).toBeGreaterThanOrEqual(0);
            expect(reviews).toBeGreaterThanOrEqual(0);
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
});
