/** @type {import('next').NextConfig} */
const nextConfig = {
    publicRuntimeConfig: {
        runtime: process.env.RUNTIME === 'kubernetes' ? 'kubernetes' : 'docker',
        disableCredits: process.env.DISABLE_CREDITS === 'true',
    },
};

export default nextConfig;
