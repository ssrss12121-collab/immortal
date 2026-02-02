// Socket Event Names
export const SOCKET_EVENTS = {
  // User room
  JOIN_USER_ROOM: 'join-user-room',
  
  // Private calling
  INITIATE_CALL: 'initiate-private-call',
  ACCEPT_CALL: 'accept-private-call',
  REJECT_CALL: 'reject-private-call',
  END_CALL: 'end-private-call',
  BUSY_CALL: 'busy-private-call',
  RINGING_CALL: 'ringing-private-call',
  
  // Call signaling
  RENEGOTIATE_CALL: 'renegotiate-private-call',
  CANDIDATE: 'candidate-private-call',
  CALL_STATE_UPDATE: 'call-state-update',
  
  // Incoming events
  INCOMING_CALL: 'incoming-private-call',
  CALL_ACCEPTED: 'private-call-accepted',
  CALL_REJECTED: 'private-call-rejected',
  CALL_ENDED: 'private-call-ended',
  CALL_BUSY: 'private-call-busy',
  CALL_ERROR: 'private-call-error',
  CALL_RINGING: 'private-call-ringing',
  CALL_RENEGOTIATE: 'private-call-renegotiate',
  CALL_STATE_UPDATED: 'private-call-state-updated',
  
  // Team calling
  JOIN_TEAM_CALL: 'join-team-call',
  LEAVE_TEAM_CALL: 'leave-team-call',
  SIGNAL_TEAM_CALL: 'signal-team-call',
  NEW_PEER_TEAM_CALL: 'new-peer-team-call',
  PEER_LEFT_TEAM_CALL: 'peer-left-team-call',
  TEAM_CALL_SIGNAL: 'team-call-signal',
  
  // Chat
  NEW_PRIVATE_MESSAGE: 'new-private-message'
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
