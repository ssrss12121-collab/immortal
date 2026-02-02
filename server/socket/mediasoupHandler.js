const mediasoup = require('mediasoup');
const config = require('../config/mediasoup');

let workers = [];
let nextWorkerIdx = 0;

const routers = new Map(); // teamId -> router

const init = async () => {
    try {
        const numWorkers = Array.isArray(mediasoup.getWorkerBinPath) ? os.cpus().length : 1;
        console.log('👷 [Mediasoup] Initializing workers...');

        for (let i = 0; i < numWorkers; i++) {
            try {
                const worker = await mediasoup.createWorker({
                    logLevel: config.worker.logLevel,
                    logTags: config.worker.logTags,
                    rtcMinPort: config.worker.rtcMinPort,
                    rtcMaxPort: config.worker.rtcMaxPort,
                });

                worker.on('died', () => {
                    console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
                    setTimeout(() => process.exit(1), 2000);
                });

                workers.push(worker);
            } catch (workerErr) {
                console.warn(`⚠️ [Mediasoup] Worker ${i} failed to start. This is common on Windows if binaries are incompatible.`);
                console.debug(workerErr);
            }
        }
        
        if (workers.length > 0) {
            console.log(`🚀 ${workers.length} mediasoup workers started`);
        } else {
            console.warn('🛑 [Mediasoup] No workers started. Live/Calling will use P2P fallback signaling.');
        }
    } catch (err) {
        console.error('❌ [Mediasoup] Initialization failed critically:', err);
    }
};

const getWorker = () => {
    const worker = workers[nextWorkerIdx];
    nextWorkerIdx = (nextWorkerIdx + 1) % workers.length;
    return worker;
};

const createWebRtcTransport = async (router) => {
    const transport = await router.createWebRtcTransport(config.webRtcTransport);

    transport.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'closed') {
            transport.close();
        }
    });

    return {
        transport,
        params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        },
    };
};

module.exports = async (io, socket) => {
    if (workers.length === 0) await init();

    const userId = socket.user._id || socket.user.id;

    socket.on('get-router-capabilities', async (teamId, callback) => {
        try {
            let router = routers.get(teamId);
            if (!router) {
                const worker = getWorker();
                router = await worker.createRouter({ mediaCodecs: config.router.mediaCodecs });
                routers.set(teamId, router);
            }
            callback(router.rtpCapabilities);
        } catch (err) {
            console.error('get-router-capabilities error:', err);
            callback({ error: err.message });
        }
    });

    socket.on('create-webrtc-transport', async ({ teamId, direction }, callback) => {
        try {
            const router = routers.get(teamId);
            if (!router) throw new Error('Router not found');

            const { transport, params } = await createWebRtcTransport(router);

            // Store transport on socket for cleanup if needed
            if (!socket.transports) socket.transports = new Map();
            socket.transports.set(transport.id, transport);

            callback(params);
        } catch (err) {
            console.error('create-webrtc-transport error:', err);
            callback({ error: err.message });
        }
    });

    socket.on('connect-webrtc-transport', async ({ transportId, dtlsParameters }, callback) => {
        try {
            const transport = socket.transports?.get(transportId);
            if (!transport) throw new Error('Transport not found');

            await transport.connect({ dtlsParameters });
            callback({ success: true });
        } catch (err) {
            console.error('connect-webrtc-transport error:', err);
            callback({ error: err.message });
        }
    });

    socket.on('produce', async ({ transportId, kind, rtpParameters, appData }, callback) => {
        try {
            const transport = socket.transports?.get(transportId);
            if (!transport) throw new Error('Transport not found');

            const producer = await transport.produce({ kind, rtpParameters, appData });

            if (!socket.producers) socket.producers = new Map();
            socket.producers.set(producer.id, producer);

            producer.on('transportclose', () => {
                producer.close();
                socket.producers.delete(producer.id);
            });

            // Notify others in the room
            const teamId = appData.teamId;
            socket.to(`team_${teamId}`).emit('new-producer', {
                producerId: producer.id,
                userId,
                kind: producer.kind,
                appData: producer.appData
            });

            callback({ id: producer.id });
        } catch (err) {
            console.error('produce error:', err);
            callback({ error: err.message });
        }
    });

    socket.on('consume', async ({ transportId, producerId, rtpCapabilities }, callback) => {
        try {
            const transport = socket.transports?.get(transportId);
            if (!transport) throw new Error('Transport not found');

            // Check if router can consume this producer
            const router = transport.router; // We need to ensure transport has access to router or find it
            // Actually, transport in mediasoup-v3 doesn't directly have .router
            // We should probably store router mapping better

            const producer = Array.from(io.sockets.sockets.values())
                .map(s => s.producers?.get(producerId))
                .find(p => !!p);

            if (!producer) throw new Error('Producer not found');

            const consumer = await transport.consume({
                producerId,
                rtpCapabilities,
                paused: true,
            });

            if (!socket.consumers) socket.consumers = new Map();
            socket.consumers.set(consumer.id, consumer);

            consumer.on('transportclose', () => {
                consumer.close();
                socket.consumers.delete(consumer.id);
            });

            consumer.on('producerclose', () => {
                consumer.close();
                socket.consumers.delete(consumer.id);
            });

            callback({
                id: consumer.id,
                producerId: consumer.producerId,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
            });
        } catch (err) {
            console.error('consume error:', err);
            callback({ error: err.message });
        }
    });

    socket.on('resume-consumer', async ({ consumerId }, callback) => {
        try {
            const consumer = socket.consumers?.get(consumerId);
            if (!consumer) throw new Error('Consumer not found');

            await consumer.resume();
            callback({ success: true });
        } catch (err) {
            console.error('resume-consumer error:', err);
            callback({ error: err.message });
        }
    });

    socket.on('get-producers', (teamId, callback) => {
        try {
            const allSockets = Array.from(io.sockets.sockets.values());
            const activeProducers = [];

            allSockets.forEach(s => {
                if (s.producers) {
                    s.producers.forEach(p => {
                        if (p.appData.teamId === teamId && s.id !== socket.id) {
                            activeProducers.push({ producerId: p.id, userId: s.user._id || s.user.id });
                        }
                    });
                }
            });

            callback(activeProducers);
        } catch (err) {
            console.error('get-producers error:', err);
            callback([]);
        }
    });

    socket.on('producer-closed', ({ producerId }) => {
        const producer = socket.producers?.get(producerId);
        if (producer) {
            const teamId = producer.appData.teamId;
            producer.close();
            socket.producers.delete(producerId);
            socket.to(`team_${teamId}`).emit('producer-closed', { producerId, userId });
        }
    });

    socket.on('disconnect', () => {
        if (socket.producers) {
            socket.producers.forEach(p => {
                const teamId = p.appData.teamId;
                p.close();
                io.to(`team_${teamId}`).emit('producer-closed', { producerId: p.id, userId });
            });
        }
        if (socket.transports) {
            socket.transports.forEach(t => t.close());
        }
    });
};
