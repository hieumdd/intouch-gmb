import { http } from '@google-cloud/functions-framework';
import express from 'express';

import { logger } from './logging.service';
import * as pipelines from './pipeline/pipeline.const';
import {
    createLocationPipelines,
    runLocationPipeline,
    runInsightPipeline,
    runReviewPipeline,
} from './pipeline/pipeline.service';
import {
    RunLocationPipelineBodySchema,
    RunInsightPipelineBodySchema,
    RunReviewPipelineBodySchema,
} from './pipeline/pipeline.request.dto';

const app = express();

app.use(({ headers, path, body }, _, next) => {
    logger.info({ headers, path, body });
    next();
});

app.post(`/${pipelines.Location.route}`, ({ body }, res) => {
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

app.post(`/${pipelines.Insight.route}`, ({ body }, res) => {
    RunInsightPipelineBodySchema.validateAsync(body)
        .then((options) => {
            runInsightPipeline(options)
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

app.post(`/${pipelines.Review.route}`, ({ body }, res) => {
    RunReviewPipelineBodySchema.validateAsync(body)
        .then((options) => {
            runReviewPipeline(options)
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

app.post(`/`, (_, res) => {
    createLocationPipelines()
        .then((result) => res.status(200).json({ result }))
        .catch((error) => {
            logger.error({ error });
            res.status(500).json({ error });
        });
});

http('main', app);
