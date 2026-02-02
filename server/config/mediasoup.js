const os = require('os');

module.exports = {
    // Worker settings
    worker: {
        rtcMinPort: 40000,
        rtcMaxPort: 49999,
        logLevel: 'warn',
        logTags: [
            'info',
            'ice',
            'dtls',
            'rtp',
            'srtp',
            'rtcp'
        ],
    },
    // Router settings
    router: {
        mediaCodecs: [
            {
                kind: 'audio',
                mimeType: 'audio/opus',
                clockRate: 48000,
                channels: 2
            },
            {
                kind: 'video',
                mimeType: 'video/VP8',
                clockRate: 90000,
                parameters: {
                    'x-google-start-bitrate': 1000
                }
            },
            {
                kind: 'video',
                mimeType: 'video/h264',
                clockRate: 90000,
                parameters: {
                    'packetization-mode': 1,
                    'profile-level-id': '42e01f',
                    'level-asymmetry-allowed': 1,
                    'x-google-start-bitrate': 1000
                }
            }
        ]
    },
    // WebRtcTransport settings
    webRtcTransport: {
        listenIps: [
            {
                ip: '0.0.0.0',
                announcedIp: '127.0.0.1' // In production, this should be the public IP
            }
        ],
        maxSctpMessageSize: 262144,
        initialAvailableOutgoingBitrate: 1000000
    }
};
