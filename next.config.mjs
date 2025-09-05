/** @type {import('next').NextConfig} */

const nextConfig = {
    publicRuntimeConfig: {
        runtime: process.env.RUNTIME === 'kubernetes' ? 'kubernetes' : 'docker',
        disableCredits: process.env.DISABLE_CREDITS === 'true',
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /@novnc\/novnc\/lib\/util\/browser\.js$/,
            type: 'javascript/esm',
        });
        return config;
    },
};

export default nextConfig;
