import axios from 'axios';
import { getSocket } from './socket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

class SocketService {
    get socket() {
        try {
            return getSocket();
        } catch {
            return null;
        }
    }

    joinTeamRoom(teamId: string) {
        if (this.socket) {
            this.socket.emit('join-team', teamId);
            console.log('Joined real team room:', teamId);
        }
    }

    sendTeamMessage(msg: any) {
        if (this.socket) {
            this.socket.emit('send-team-message', msg);
        }
    }

    editMessage(messageId: string, newContent: string, teamId: string) {
        if (this.socket) {
            this.socket.emit('edit-team-message', { messageId, text: newContent, teamId });
        }
    }

    deleteMessage(messageId: string, teamId: string) {
        if (this.socket) {
            this.socket.emit('delete-team-message', { messageId, teamId });
        }
    }

    typing(teamId: string, senderName: string) {
        if (this.socket) {
            this.socket.emit('typing', { teamId, senderName });
        }
    }

    stopTyping(teamId: string) {
        if (this.socket) {
            this.socket.emit('stop-typing', { teamId });
        }
    }

    // --- TEAM MANAGEMENT (REAL BACKEND) ---

    async inviteUser(teamId: string, receiverId: string, message: string = '') {
        try {
            const response = await api.post('/teams/invite', { teamId, receiverId, message });
            if (response.data.success) {
                alert(`Transmission sent`);
                return true;
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to send invite');
            throw error;
        }
        return false;
    }

    async acceptInviteAPI(notificationId: string, teamId: string, userId: string) {
        try {
            const response = await api.post('/teams/accept', { teamId, userId, notificationId });
            if (response.data.success) {
                window.dispatchEvent(new Event('user-session-update'));
                return true;
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to accept');
            throw error;
        }
        return false;
    }

    async rejectInviteAPI(notificationId: string) {
        try {
            const response = await api.delete(`/teams/reject/${notificationId}`);
            if (response.data.success) {
                return true;
            }
        } catch (error: any) {
            console.error('Failed to reject', error);
        }
        return false;
    }

    async kickMember(teamId: string, memberId: string) {
        try {
            const response = await api.post('/teams/kick', { teamId, memberId });
            if (response.data.success) {
                return true;
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to kick member');
        }
        return false;
    }

    async updateTeam(teamId: string, updates: any) {
        try {
            const response = await api.post(`/teams/update/${teamId}`, updates);
            if (response.data.success) {
                return response.data.team;
            }
            throw new Error(response.data.message || 'Update failed');
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Failed to update team';
            alert(msg);
            throw new Error(msg);
        }
    }

    async transferLeadership(teamId: string, newLeaderId: string) {
        try {
            const response = await api.post('/teams/transfer-leadership', { teamId, newLeaderId });
            if (response.data.success) {
                return true;
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to transfer leadership');
        }
        return false;
    }
}

export const socketService = new SocketService();
