import AWS from 'aws-sdk';
import { promises as fs } from 'fs';
import { GithubActionConfiguration } from './github-action-configuration';
import mime from 'mime-types';
import { PutBucketWebsiteRequest } from 'aws-sdk/clients/s3';

export class S3Manager {
    private s3: AWS.S3;

    constructor(config: GithubActionConfiguration) {
        this.s3 = new AWS.S3({
            endpoint: "https://storage.yandexcloud.net",
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        });
    }

    get instance(): AWS.S3 {
        return this.s3;
    }

    async clearBucket(bucket: string): Promise<void> {
        const listedObjects = await this.s3.listObjects({ Bucket: bucket }).promise();

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            return;
        }
    
        const deleteKeys = listedObjects.Contents.map((c) => ({ Key: c.Key as string }));
    
        await this.s3.deleteObjects({ Bucket: bucket, Delete: { Objects: deleteKeys } }).promise();
    
        if (listedObjects.IsTruncated) {
            await this.clearBucket(bucket);
        }
    }

    async createEmptyBucket(bucket: string) {
        try {
            await this.s3.createBucket({
                Bucket: bucket
            }).promise();
            const putBucketWebsiteRequest: PutBucketWebsiteRequest = {
                Bucket: bucket,
                WebsiteConfiguration: {
                  ErrorDocument: {
                    Key: 'index.html'
                  },
                  IndexDocument: {
                    Suffix: 'index.html'
                  },
                }
            };
            await this.s3.putBucketWebsite(putBucketWebsiteRequest).promise();
        } catch (error) {
            if (error.statusCode === 409) {
                // if bucket already exists we should clean it before deploying
                await this.clearBucket(bucket);
                return;
            }
            throw error;
        }
    }

    async uploadFile(bucket: string, key: string, filePath: string) {
        const file = await fs.readFile(filePath);
        await this.s3.upload({
            Key: key,
            Bucket: bucket,
            Body: file,
            ContentType: mime.lookup(filePath) as string,
            ACL: 'public-read'
        }).promise();
    }

    async removeBucket(bucket: string) {
        await this.clearBucket(bucket);
        await this.s3.deleteBucket({ Bucket: bucket }).promise();
    }
}