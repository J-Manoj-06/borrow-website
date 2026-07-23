/**
 * Cloudflare R2 Storage Configuration Reader
 */

export const getR2Config = () => {
  return {
    accountId: import.meta.env.VITE_R2_ACCOUNT_ID || '',
    bucketName: import.meta.env.VITE_R2_BUCKET_NAME || 'borrow-library-assets',
    publicDomain: import.meta.env.VITE_R2_PUBLIC_DOMAIN || 'https://assets.borrowlibrary.com',
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '',
    s3Endpoint: import.meta.env.VITE_R2_S3_ENDPOINT || '',
  };
};

export const isR2Configured = () => {
  const config = getR2Config();
  return Boolean(config.accountId && config.bucketName && config.publicDomain);
};

export default getR2Config;
