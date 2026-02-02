// Calling Constants
export const CALL_CONSTANTS = {
  // Timers (in milliseconds)
  DURATION_UPDATE_INTERVAL: 1000,
  SOCKET_CHECK_INTERVAL: 500,
  RENEGOTIATION_TIMEOUT: 5000,
  BUSY_STATUS_DURATION: 2000,
  OFFLINE_STATUS_DURATION: 2000,
  
  // WebRTC Configuration
  ICE_CANDIDATE_POOL_SIZE: 10,
  
  // Video Constraints
  VIDEO_WIDTH_IDEAL: 1280,
  VIDEO_HEIGHT_IDEAL: 720,
  
  // STUN Servers
  STUN_SERVERS: [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:stun2.l.google.com:19302',
    'stun:stun.services.mozilla.com'
  ]
} as const;

// Call Types
export type CallType = 'video' | 'audio';

// Call Status
export type CallStatus = 'IDLE' | 'RINGING' | 'CONNECTING' | 'STABLE' | 'BUSY' | 'OFFLINE' | 'DISCONNECTED';
