import { GithubActionConfiguration } from '../models/github-action-configuration';
import { S3Manager } from '../models/s3-manager';

export async function remove(config: GithubActionConfiguration) {
    const s3Manager = new S3Manager(config);
    await s3Manager.removeBucket(config.bucket);
}