/** @type {import('next').NextConfig} */

const nextConfig = {
    env: {
        RUNTIME: process.env.RUNTIME === 'kubernetes' ? 'kubernetes' : 'docker',
        DISABLE_CREDITS: process.env.DISABLE_CREDITS === 'true' ? 'true' : 'false',
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /@novnc\/novnc\/lib\/util\/browser\.js$/,
            type: 'javascript/esm',
        });
        return config;
    }
};

export default nextConfig;
