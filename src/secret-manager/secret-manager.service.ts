import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export const getSecret = async (name: string) => {
    return client
        .getProjectId()
        .then((projectId) => `projects/${projectId}/secrets/${name}/versions/latest`)
        .then((path) => client.accessSecretVersion({ name: path }))
        .then(([res]) => res.payload?.data?.toString() || '');
};
