import { CloudTasksClient, protos } from '@google-cloud/tasks';
import HttpMethod = protos.google.cloud.tasks.v2.HttpMethod;
import { v4 as uuidv4 } from 'uuid';

const client = new CloudTasksClient();

const LOCATION = 'us-central1';
const QUEUE = 'google-my-business';

const URL = process.env.PUBLIC_URL || '';

export const createTask = async <P>(endpoint: string, payload: P, nameFn: (p: P) => string) => {
    const [projectId, serviceAccountEmail] = await Promise.all([
        client.getProjectId(),
        client.auth.getCredentials().then((credentials) => credentials.client_email),
    ]);

    const task = {
        parent: client.queuePath(projectId, LOCATION, QUEUE),
        task: {
            name: client.taskPath(projectId, LOCATION, QUEUE, `${nameFn(payload)}-${uuidv4()}`),
            httpRequest: {
                httpMethod: HttpMethod.POST,
                headers: { 'Content-Type': 'application/json' },
                url: URL + endpoint,
                oidcToken: { serviceAccountEmail },
                body: Buffer.from(JSON.stringify(payload)).toString('base64'),
            },
        },
    };

    return client.createTask(task).then(([response]) => response);
};
