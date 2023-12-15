import { runInsightPipeline, runReviewPipeline, initiatePipelines } from './pipeline.service';

it('initiatePipelines', async () => {
    return initiatePipelines().catch((error) => {
        console.error(error);
        throw error;
    });
});

it('pipeline/insight', async () => {
    const options = {
        businessId: 'intouchvet1@gmail.com',
        accountId: '102424011136800668773',
        locationId: '9819420616193399205',
        start: '2023-01-01',
        end: '2024-01-01',
    };

    return runInsightPipeline(options)
        .then((result) => expect(result).toBeGreaterThanOrEqual(0))
        .catch((error) => {
            console.error(error);
            throw error;
        });
});

it('pipeline/review', async () => {
    const options = {
        businessId: 'intouchvet1@gmail.com',
        accountId: '102424011136800668773',
        locationId: '9819420616193399205',
    };

    return runReviewPipeline(options)
        .then((result) => expect(result).toBeGreaterThanOrEqual(0))
        .catch((error) => {
            console.error(error);
            throw error;
        });
});
