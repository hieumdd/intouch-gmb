import { http } from '@google-cloud/functions-framework';
import express from 'express';

import { logger } from './logging.service';
import {
    runLocationPipeline,
    RunInsightPipeline,
    RunReviewPipeline,
} from './pipeline/pipeline.service';
import {
    RunLocationPipelineBodySchema,
    RunInsightPipelineBodySchema,
    RunReviewPipelineBodySchema,
} from './pipeline.request.dto';
import { LOCATION_ROUTE, INSIGHT_ROUTE, REVIEW_ROUTE } from './route.const';

const app = express();

app.use(({ headers, path, body }, _, next) => {
    logger.info({ headers, path, body });
    next();
});

app.post(LOCATION_ROUTE, ({ body }, res) => {
    RunLocationPipelineBodySchema.validateAsync(body)
        .then((options) => {
            runLocationPipeline(options)
                .then((result) => res.status(200).json({ result }))
                .catch((error) => {
                    logger.error({ error });
                    res.status(500).json({ error });
                });
        })
        .catch((error) => {
            logger.warn({ error });
            res.status(400).json({ error });
        });
});

app.post(INSIGHT_ROUTE, ({ body }, res) => {
    RunInsightPipelineBodySchema.validateAsync(body)
        .then((options) => {
            RunInsightPipeline(options)
                .then((result) => res.status(200).json({ result }))
                .catch((error) => {
                    logger.error({ error });
                    res.status(500).json({ error });
                });
        })
        .catch((error) => {
            logger.warn({ error });
            res.status(400).json({ error });
        });
});

app.post(REVIEW_ROUTE, ({ body }, res) => {
    RunReviewPipelineBodySchema.validateAsync(body)
        .then((options) => {
            RunReviewPipeline(options)
                .then((result) => res.status(200).json({ result }))
                .catch((error) => {
                    logger.error({ error });
                    res.status(500).json({ error });
                });
        })
        .catch((error) => {
            logger.warn({ error });
            res.status(400).json({ error });
        });
});

http('main', app);
