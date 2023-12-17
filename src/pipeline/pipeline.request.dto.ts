import Joi from 'joi';

import { RunLocationPipelineOptions } from './pipeline.service';

export const RunLocationPipelineBodySchema = Joi.object<RunLocationPipelineOptions>({
    businessId: Joi.string().required(),
    accountId: Joi.string().required(),
    locationId: Joi.string().required(),
});
