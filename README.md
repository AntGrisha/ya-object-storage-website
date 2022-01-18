# Yandex object storage website management

Deploy and remove [static website to Yandex Object Storage](https://cloud.yandex.ru/docs/storage/operations/hosting/setup)

With this action you can manage multiple versions of your website in Yandex Object Storage.

## Configuration

| Key               | Value                                        | Type      | Required |
| ----------------- | -------------------------------------------- | --------- | -------- |
| `access-key-id`     | Service account access key id                | `string`  | Yes      |
| `secret-access-key` | Service account secret access key            | `string`  | Yes      |
| `bucket`          | Bucket name                                  | `string`  | Yes      |
| `path`            | Path to upload folder                        | `string`  | Yes      |
| `remove`           | Removes bucket and website (default: `false`) | `boolean` | No       |

## Examples

```yaml
name: Deploy website

on:
    push:
        branches:
            - feature/*

jobs:
    deploy:
        runs-on: ubuntu-latest

        steps:
            - uses: actions/checkout@v2
            - uses: actions/setup-node@v1
              with:
                  node-version: '16'
            # Build
            - run: npm ci
            - run: npm run build
            # Deploy
            - uses: antgrisha/ya-object-storage-website-action@v1
              with:
                  access-key-id: ${{ secrets.ACCESS_KEY_ID }}
                  secret-access-key: ${{ secrets.SECRET_ACCESS_KEY }}
                  bucket: "bucket-name"
                  path: "dist"
```