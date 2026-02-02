const mongoose = require('mongoose');
require('dotenv').config();

const diagnose = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const Message = mongoose.connection.db.collection('messages');
        const User = mongoose.connection.db.collection('users');

        const messageCount = await Message.countDocuments();
        console.log('Total Messages:', messageCount);

        const sampleMessages = await Message.find({ type: 'PRIVATE' }).limit(5).toArray();
        console.log('Sample Private Messages:');
        sampleMessages.forEach(m => {
            console.log(`- ID: ${m._id}, SenderId: ${m.senderId} (${typeof m.senderId}), ReceiverId: ${m.receiverId} (${typeof m.receiverId}), Text: ${m.text.substring(0, 20)}`);
        });

        const users = await User.find({}).limit(5).toArray();
        console.log('Sample Users:');
        users.forEach(u => {
            console.log(`- ID: ${u._id} (${typeof u._id}), IGN: ${u.ign}`);
        });

        if (sampleMessages.length > 0) {
            const userId = sampleMessages[0].senderId;
            const targetId = sampleMessages[0].receiverId;
            
            console.log(`\nTesting Aggregation for userId: ${userId}`);
            
            const results = await Message.aggregate([
                {
                    $match: {
                        type: 'PRIVATE',
                        $or: [{ senderId: userId }, { receiverId: userId }]
                    }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ['$senderId', userId] },
                                '$receiverId',
                                '$senderId'
                            ]
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                }
            ]).toArray();

            console.log('Aggregation Results:', JSON.stringify(results, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

diagnose();
