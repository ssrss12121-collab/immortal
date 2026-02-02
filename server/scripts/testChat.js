const mongoose = require('mongoose');
const chatController = require('../controllers/chatController');
const Message = require('../models/Message');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/immortal_zone';

async function testChat() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const teamId = new mongoose.Types.ObjectId();
        const senderId = new mongoose.Types.ObjectId();

        console.log('Testing saveMessage with:', {
            teamId: teamId.toString(),
            senderId: senderId.toString(),
            senderName: 'TestUser',
            text: 'Hello World'
        });

        const result = await chatController.saveMessage({
            teamId: teamId.toString(),
            senderId: senderId.toString(),
            senderName: 'TestUser',
            text: 'Hello World',
            tempId: 'temp-' + Date.now()
        });

        if (result) {
            console.log('✅ Message saved successfully:', result);
            // Clean up
            await Message.findByIdAndDelete(result.id);
            console.log('Cleanup: Deleted test message.');
        } else {
            console.error('❌ Failed to save message (returned null).');
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

testChat();
