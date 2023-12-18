import express from 'express';
import bodyParser from 'body-parser';
import { ValidatedRequest, createValidator } from 'express-joi-validation';

import { logger } from './logging.service';
import { exchangeCodeForToken, getAuthorizationURL } from './google-my-business/auth/auth.service';
import { CallbackQueryRequest, CallbackQuerySchema } from './google-my-business/auth/auth.request.dto';
import * as pipelines from './pipeline/pipeline.const';
import { initiatePipelines, runLocationPipeline } from './pipeline/pipeline.service';
import { RunLocationPipelineRequest, RunLocationPipelineBodySchema } from './pipeline/pipeline.request.dto';

['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
        logger.info({ action: 'interupt' });
        process.exit(0);
    });
});

const app = express();
const validator = createValidator({ joi: { stripUnknown: true } });

app.use(bodyParser.json());

app.use(({ method, path, body }, res, next) => {
    logger.info({ method, path, body });
    res.on('finish', () => {
        logger.info({ method, path, body, status: res.statusCode });
    });
    next();
});

app.get('/authorize', (_, res) => {
    res.status(301).redirect(getAuthorizationURL());
});

app.get(
    '/authorize/callback',
    validator.query(CallbackQuerySchema),
    ({ query: { code } }: ValidatedRequest<CallbackQueryRequest>, res) => {
        exchangeCodeForToken(code)
            .then((token) => res.status(200).json({ token }))
            .catch((error) => {
                logger.error({ error });
                res.status(500).json({ error });
            });
    },
);

app.post(
    `/${pipelines.Location.route}`,
    validator.body(RunLocationPipelineBodySchema),
    ({ body }: ValidatedRequest<RunLocationPipelineRequest>, res) => {
        runLocationPipeline(body)
            .then((result) => res.status(200).json({ result }))
            .catch((error) => {
                logger.error({ error });
                res.status(500).json({ error });
            });
    },
);

app.post(`/`, (_, res) => {
    initiatePipelines()
        .then((result) => res.status(200).json({ result }))
        .catch((error) => {
            logger.error({ error });
            res.status(500).json({ error });
        });
});

app.listen(8080);
