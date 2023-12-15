import express from 'express';

import { logger } from './logging.service';
import { CallbackQuerySchema } from './google-my-business/auth/auth.request.dto';
import { exchangeCodeForToken, getAuthorizationURL } from './google-my-business/auth/auth.service';
import * as pipelines from './pipeline/pipeline.const';
import { initiatePipelines, runLocationPipeline } from './pipeline/pipeline.service';
import { RunLocationPipelineBodySchema } from './pipeline/pipeline.request.dto';

const app = express();

app.use(({ headers, path, body }, _, next) => {
    logger.info({ headers, path, body });
    next();
});

app.get('/authorize', (_, res) => {
    getAuthorizationURL().then((url) => res.redirect(url));
});

app.get('/authorize/callback', ({ query }, res) => {
    CallbackQuerySchema.validateAsync(query, { stripUnknown: true })
        .then(({ code }) => {
            exchangeCodeForToken(code).then((token) => res.status(200).json({ token }));
        })
        .catch((error) => {
            logger.warn({ error });
            res.status(400).json({ error });
        });
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

app.post(`/`, (_, res) => {
    initiatePipelines()
        .then((result) => res.status(200).json({ result }))
        .catch((error) => {
            logger.error({ error });
            res.status(500).json({ error });
        });
});

app.listen(8080);
