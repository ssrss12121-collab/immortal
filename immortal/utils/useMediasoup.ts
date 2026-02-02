import { useState, useEffect, useRef, useCallback } from 'react';
import * as mediasoupClient from 'mediasoup-client';
import { getSocket } from './socket';

export interface RemoteParticipant {
    userId: string;
    streams: {
        video?: MediaStream;
        audio?: MediaStream;
        screen?: MediaStream;
    };
}

export const useMediasoup = ({ teamId }: { teamId: string }) => {
    const [participants, setParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
    const device = useRef<mediasoupClient.types.Device | null>(null);
    const sendTransport = useRef<mediasoupClient.types.Transport | null>(null);
    const recvTransport = useRef<mediasoupClient.types.Transport | null>(null);
    const producers = useRef<Map<string, mediasoupClient.types.Producer>>(new Map());
    const consumers = useRef<Map<string, mediasoupClient.types.Consumer>>(new Map());
    const socket = getSocket();

    const createSendTransport = useCallback(async (device: mediasoupClient.types.Device) => {
        const params = await new Promise<any>((resolve) => {
            socket.emit('create-webrtc-transport', { teamId, direction: 'send' }, resolve);
        });

        if (params.error) throw new Error(params.error);

        const transport = device.createSendTransport(params);
        sendTransport.current = transport;

        transport.on('connect', ({ dtlsParameters }, callback, errback) => {
            socket.emit('connect-webrtc-transport', { transportId: transport.id, dtlsParameters }, (res: any) => {
                if (res.error) errback(res.error);
                else callback();
            });
        });

        transport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
            socket.emit('produce', {
                transportId: transport.id,
                kind,
                rtpParameters,
                appData: { ...appData, teamId }
            }, (res: any) => {
                if (res.error) errback(res.error);
                else callback({ id: res.id });
            });
        });
    }, [socket, teamId]);

    const createRecvTransport = useCallback(async (device: mediasoupClient.types.Device) => {
        const params = await new Promise<any>((resolve) => {
            socket.emit('create-webrtc-transport', { teamId, direction: 'recv' }, resolve);
        });

        if (params.error) throw new Error(params.error);

        const transport = device.createRecvTransport(params);
        recvTransport.current = transport;

        transport.on('connect', ({ dtlsParameters }, callback, errback) => {
            socket.emit('connect-webrtc-transport', { transportId: transport.id, dtlsParameters }, (res: any) => {
                if (res.error) errback(res.error);
                else callback();
            });
        });
    }, [socket, teamId]);

    const consume = useCallback(async (producerId: string, userId: string, kind: string, appData: any) => {
        if (!recvTransport.current || !device.current) return;

        const params = await new Promise<any>((resolve) => {
            socket.emit('consume', {
                transportId: recvTransport.current?.id,
                producerId,
                rtpCapabilities: device.current?.rtpCapabilities
            }, resolve);
        });

        if (params.error) throw new Error(params.error);

        const consumer = (await recvTransport.current.consume(params)) as mediasoupClient.types.Consumer;
        consumers.current.set(consumer.id, consumer);

        const { track } = consumer;
        setParticipants(prev => {
            const next = new Map(prev);
            const existing = next.get(userId);
            const participant = (existing || {
                userId,
                streams: {}
            }) as RemoteParticipant;

            const streamType = (appData as any).isScreen ? 'screen' : (kind === 'video' ? 'video' : 'audio');

            if (!participant.streams[streamType]) {
                participant.streams[streamType] = new MediaStream();
            }
            participant.streams[streamType]!.addTrack(track);

            next.set(userId, { ...participant });
            return next;
        });

        socket.emit('resume-consumer', { consumerId: consumer.id }, () => { });
    }, [socket]);

    const initMediasoup = useCallback(async () => {
        try {
            const rtpCapabilities = await new Promise<any>((resolve) => {
                socket.emit('get-router-capabilities', teamId, resolve);
            });

            if (rtpCapabilities.error) throw new Error(rtpCapabilities.error);

            const newDevice = new mediasoupClient.Device();
            await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
            device.current = newDevice;

            await createSendTransport(newDevice);
            await createRecvTransport(newDevice);

            // Fetch Existing Producers
            socket.emit('get-producers', teamId, (existingProducers: { producerId: string, userId: string, kind: string, appData: any }[]) => {
                existingProducers.forEach(({ producerId, userId, kind, appData }) => {
                    consume(producerId, userId, kind, appData);
                });
            });

            console.log('🚀 Mediasoup SFU initialized');
        } catch (err) {
            console.error('Failed to init Mediasoup:', err);
        }
    }, [socket, teamId, createSendTransport, createRecvTransport, consume]);

    const produce = async (track: MediaStreamTrack, isScreen = false) => {
        if (!sendTransport.current) return;
        const producer = (await sendTransport.current.produce({
            track,
            appData: { teamId, isScreen }
        })) as mediasoupClient.types.Producer;
        producers.current.set(producer.id, producer);
        return producer;
    };

    const stopProducing = async (producerId: string) => {
        const producer = producers.current.get(producerId);
        if (producer) {
            producer.close();
            producers.current.delete(producerId);
            socket.emit('producer-closed', { producerId });
        }
    };

    useEffect(() => {
        initMediasoup();

        socket.on('new-producer', ({ producerId, userId, kind, appData }: { producerId: string, userId: string, kind: string, appData: any }) => {
            consume(producerId, userId, kind, appData);
        });

        socket.on('producer-closed', ({ producerId, userId }: { producerId: string, userId: string }) => {
            const consumerArray = Array.from(consumers.current.values()) as mediasoupClient.types.Consumer[];
            const consumer = consumerArray.find(c => c.producerId === producerId);

            if (consumer) {
                consumer.close();
                consumers.current.delete(consumer.id);
                setParticipants(prev => {
                    const next = new Map(prev);
                    const participant = next.get(userId) as RemoteParticipant | undefined;
                    if (participant) {
                        const updatedStreams = { ...participant.streams };
                        // Check which stream it belonged to (approximate by kind)
                        if (consumer.kind === 'video') {
                            updatedStreams.video = undefined;
                            updatedStreams.screen = undefined;
                        } else {
                            updatedStreams.audio = undefined;
                        }
                        next.set(userId, { ...participant, streams: updatedStreams });
                    }
                    return next;
                });
            }
        });

        return () => {
            socket.off('new-producer');
            socket.off('producer-closed');
            if (sendTransport.current) sendTransport.current.close();
            if (recvTransport.current) recvTransport.current.close();
            producers.current.forEach(p => p.close());
        };
    }, [initMediasoup, socket, consume]);

    return { produce, stopProducing, participants };
};
