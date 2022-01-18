import { promises as fs } from 'fs';
import pMap from 'p-map';
import readdir from 'recursive-readdir';
import { GithubActionConfiguration } from '../models/github-action-configuration';
import { S3Manager } from '../models/s3-manager';

export async function deploy(config: GithubActionConfiguration) {
    if (!await fs.stat(config.path)) {
        throw new Error(`Folder ${config.path} doesn't exists`);
    }

    const s3Manager = new S3Manager(config);
    await s3Manager.createEmptyBucket(config.bucket);

    const filesToUpload = await readdir(config.path);
    const dirPrefix = config.path.split('./').pop();
    await pMap(
        filesToUpload,
        async (filePath: string) => {
            const key = filePath.split(dirPrefix!).pop();
            await s3Manager.uploadFile(config.bucket, key!, filePath);
        },
        { concurrency: 10 }
    );
}