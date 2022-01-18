import * as core from '@actions/core';
import { deploy } from './actions/deploy';
import { remove } from './actions/remove';
import { GithubActionConfiguration } from './models/github-action-configuration';

const config: GithubActionConfiguration = {
    accessKeyId: core.getInput("access-key-id", { required: true }),
    secretAccessKey: core.getInput("secret-access-key", { required: true }),
    bucket: core.getInput("bucket", { required: true }),
    path: core.getInput("path", { required: true }),
    remove: core.getInput("remove", { required: false }) === 'true' ? true : false,
};

// adding trailing slash if does not exist
if (config.path[config.path.length - 1] !== '/') {
    config.path += '/';
}

const run = async () => {
    if (config.remove) {
        await remove(config);
        return;
    }

    await deploy(config);
};

run().catch((err) => core.setFailed(err));
