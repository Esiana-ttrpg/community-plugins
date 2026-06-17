import {
  createS3CompatibleDriver,
  parseS3DriverConfig,
  S3_COMPATIBLE_PROVIDER_ID,
  S3_DRIVER_VERSION,
} from './s3Driver.js';

function resolveS3CompatibleConfig() {
  const endpoint = process.env.S3_ENDPOINT?.trim() || undefined;
  return {
    endpoint,
    region: process.env.S3_REGION?.trim() ?? '',
    bucket: process.env.S3_BUCKET?.trim() ?? '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID?.trim() ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY?.trim() ?? '',
    forcePathStyle:
      process.env.S3_FORCE_PATH_STYLE === 'true' ||
      (endpoint !== undefined && process.env.S3_FORCE_PATH_STYLE !== 'false'),
  };
}

export function register(_router, context) {
  context.registerStorageProvider({
    providerId: S3_COMPATIBLE_PROVIDER_ID,
    displayName: 'S3-Compatible Storage Driver',
    version: S3_DRIVER_VERSION,
    resolveConfig: resolveS3CompatibleConfig,
    factory: (config) => createS3CompatibleDriver(parseS3DriverConfig(config)),
    capabilities: {
      redirectDelivery: true,
      metrics: true,
      orphanDetection: false,
    },
  });
}
