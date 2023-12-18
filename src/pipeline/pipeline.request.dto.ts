import Joi from 'joi';
import { ContainerTypes, ValidatedRequestSchema } from 'express-joi-validation';

import { RunLocationPipelineOptions } from './pipeline.service';

export type RunLocationPipelineBody = RunLocationPipelineOptions;

export interface RunLocationPipelineRequest extends ValidatedRequestSchema {
    [ContainerTypes.Body]: RunLocationPipelineBody;
}

export const RunLocationPipelineBodySchema = Joi.object<RunLocationPipelineBody>({
    businessId: Joi.string().required(),
    accountId: Joi.string().required(),
    locationId: Joi.string().required(),
});
