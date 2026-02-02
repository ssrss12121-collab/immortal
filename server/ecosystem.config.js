module.exports = {
    apps: [
        {
            name: 'immortal-zone-api',
            script: 'index.js',
            instances: 'max', // Multi-core clustering
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
            },
            env_development: {
                NODE_ENV: 'development',
            },
            max_memory_restart: '1G',
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
        },
    ],
};
