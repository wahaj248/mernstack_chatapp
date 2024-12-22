const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation');
const Group = require('../models/GroupModel');

const app = express();

// Create server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});

// Track online users
const onlineUser = new Set();

io.on('connection', async (socket) => {
    console.log("User connected: ", socket.id);

    const token = socket.handshake.auth.token;
    // Get user details from token
    const user = await getUserDetailsFromToken(socket, token);

    if (user && user._id) {

        socket.join(user._id.toString());
        onlineUser.add(user._id.toString());
        io.emit('onlineUser', Array.from(onlineUser));
    } else {
        console.error('User not found or token invalid');
        socket.disconnect();  // Disconnect the socket if user is not valid
        return;
    }

    // Handle 'message-page' event
    socket.on('message-page', async (userId) => {
        try {
            let payload = {}
            const userDetails = await UserModel.findById(userId).select("-password");
            if (userDetails) {
                payload = {
                    _id: userDetails?._id,
                    type: "user",
                    name: userDetails?.name,
                    email: userDetails?.email,
                    profile_pic: userDetails?.profile_pic,
                    online: onlineUser.has(userId),
                };
            } else {
                const groupDetails = await Group.findById(userId).populate("members");
                payload = {
                    _id: groupDetails?._id,
                    type: "group",
                    name: groupDetails?.name,
                    members: groupDetails?.members,
                    profile_pic: groupDetails?.profile_pic,
                };
                const groupMessages = await MessageModel.find({
                    groupId: groupDetails._id,
                }).populate('msgByUserId', 'name profile_pic')
                    .sort({ createdAt: 1 });
                // Emit previous group messages
                socket.emit('group:message', groupMessages || []);
            }

            socket.emit('message-user', payload);

            // Get previous messages
            const conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: user._id, receiver: userId },
                    { sender: userId, receiver: user._id },
                ]
            }).populate('messages').sort({ updatedAt: -1 });

            socket.emit('message', conversation?.messages || []);
        } catch (error) {
            console.error('Error fetching message-page:', error);
        }
    });

    // Handle 'new message' event
    socket.on('new message', async (data) => {
        try {
            // Check if conversation exists
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data.sender, receiver: data.receiver },
                    { sender: data.receiver, receiver: data.sender },
                ]
            });

            // Create a new conversation if none exists
            if (!conversation) {
                conversation = await new ConversationModel({
                    sender: data.sender,
                    receiver: data.receiver,
                }).save();
            }

            // Save the new message
            const message = new MessageModel({
                text: data.text,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                msgByUserId: data.msgByUserId,
            });
            const savedMessage = await message.save();

            // Update conversation with the new message
            await ConversationModel.updateOne({ _id: conversation._id }, {
                "$push": { messages: savedMessage._id },
            });

            // Emit updated messages to both sender and receiver
            const updatedConversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data.sender, receiver: data.receiver },
                    { sender: data.receiver, receiver: data.sender },
                ]
            }).populate('messages').sort({ updatedAt: -1 });

            // Include sender name and text in the emitted message data
            const sender = await UserModel.findById(data.sender);
            io.to(data.sender).emit('message', updatedConversation?.messages || []);
            io.to(data.receiver).emit('message', updatedConversation?.messages || []);
            io.to(data.receiver).emit('new message', {
                senderName: sender.name,  // Send sender's name
                text: data.text,           // Send the message text
            });

            // Send updated conversation to both users
            const conversationSender = await getConversation(data.sender);
            const conversationReceiver = await getConversation(data.receiver);

            io.to(data.sender).emit('conversation', conversationSender);
            io.to(data.receiver).emit('conversation', conversationReceiver);
        } catch (error) {
            console.error('Error handling new message:', error);
        }
    });

    socket.on('new:group:message', async (data) => {
        try {
            const { groupId, text, imageUrl, videoUrl, msgByUserId } = data;
            console.log(data);
            // Ensure the group exists
            const group = await Group.findById(groupId).populate('members');
            if (!group) {
                return socket.emit('error', { message: 'Group not found' });
            }

            // Save the new message
            const message = new MessageModel({
                text,
                imageUrl,
                videoUrl,
                msgByUserId,
                groupId,
            });

            await message.save();

            const updatedgroupMessages = await MessageModel.find({
                groupId,
            }).populate('msgByUserId', 'name profile_pic')
                .sort({ createdAt: 1 });

            group.members.forEach((member) => {
                io.to(member._id.toString()).emit('group:message', updatedgroupMessages);
                io.to(member._id.toString()).emit('new message', {
                    senderName: member.name,
                    text,
                });
            });

            // Optionally, you can send the updated message list to all group members
            // const updatedMessages = await MessageModel.find({ groupId })
            //     .populate('msgByUserId', 'name profile_pic') // Populate sender details
            //     .sort({ createdAt: 1 });

            // group.members.forEach((member) => {
            //     io.to(member._id.toString()).emit('group:messages', {
            //         groupId,
            //         messages: updatedMessages,
            //     });
            // });
        } catch (error) {
            console.error('Error handling new group message:', error);
            socket.emit('error', { message: 'Failed to send group message' });
        }
    });


    // Handle 'sidebar' event
    socket.on('sidebar', async (currentUserId) => {
        try {
            const conversation = await getConversation(currentUserId);
            socket.emit('conversation', conversation);
        } catch (error) {
            console.error('Error fetching sidebar:', error);
        }
    });

    socket.on('start-call', ({ callerId, receiverId, roomId }) => {
        // Emit to the receiver that there's an incoming call
        io.to(receiverId).emit('incoming-call', {
            callerId,
            callerName: user.name,  // The backend sends the caller's name directly
            roomId
        });
    });
    socket.on('start:group:call', async ({ members, roomId }) => {
        const callerId = socket.data.user._id;
        members.forEach(member => {
            if (member._id.toString() !== callerId) { // Exclude the caller
                io.to(member._id.toString()).emit('incoming-call', {
                    callerId,
                    callerName: user.name,
                    roomId,
                    // groupName: group.name,
                });
            }
        });
    });

    socket.on('start-group-call', ({ callerId, receiversId, roomId, groupName }) => {
        receiversId.map((receiverId) => {
            io.to(receiverId).emit('incoming-group-call', {
                callerId,
                groupName,
                roomId
            })
        })
    })

    socket.on('accept-call', ({ roomId, callerId, receiverId }) => {
        // Emit to both caller and receiver that the call has started
        io.to(callerId).emit('call-accepted', { roomId });
        io.to(receiverId).emit('call-accepted', { roomId });
    });

    socket.on('call-rejected', ({ callerId, receiverId }) => {
        // Notify the caller that the call was rejected
        io.to(callerId).emit('call-rejected', { receiverId });
    });


    const getGroupConversation = async (groupId) => {
        const groupMessages = await MessageModel.find({ groupId })
            .sort({ updatedAt: -1 })
            .populate('msgByUserId', 'name profile_pic');

        const unseenMsgCount = groupMessages.reduce((prev, curr) => {
            if (!curr.seen) {
                return prev + 1;
            }
            return prev;
        }, 0);

        return {
            groupId,
            unseenMsgCount,
            lastMsg: groupMessages[groupMessages.length - 1],
            messages: groupMessages
        };
    };

    // Handle 'seen' event
    socket.on('seen', async (data) => {
        const { conversationId, conversationType } = data;
        console.log(conversationId);
        try {
            let conversationMessageId = [];
            if (conversationType === 'user') {
                // Direct conversation logic
                const conversation = await ConversationModel.findOne({
                    "$or": [
                        { sender: socket.data.user._id, receiver: conversationId },
                        { sender: conversationId, receiver: socket.data.user._id },
                    ]
                });

                if (conversation) {
                    conversationMessageId = conversation.messages || [];
                }
            } else if (conversationType === 'group') {
                // Group conversation logic
                const groupMessages = await MessageModel.find({
                    groupId: conversationId
                });
                conversationMessageId = groupMessages?.map(msg => msg._id);
            }

            // Update message seen status
            const data = await MessageModel.updateMany(
                {
                    _id: { "$in": conversationMessageId },
                    msgByUserId: { "$ne": user._id }
                },
                { "$set": { seen: true } }
            );

            // Emit updated conversation data
            if (conversationType === 'user') {
                const conversationSender = await getConversation(socket.data.user._id.toString());
                const conversationReceiver = await getConversation(conversationId);
                io.to(socket.data.user._id.toString()).emit('conversation', conversationSender);
                io.to(conversationId).emit('conversation', conversationReceiver);

            } else if (conversationType === 'group') {
                const groupMembers = await Group.findById(conversationId).select('members');
                const groupConversation = await getGroupConversation(conversationId);
                // Emit to all group members
                groupMembers.members.forEach(memberId => {
                    io.to(memberId.toString()).emit('group:conversation', groupConversation);
                });
            }

        } catch (error) {
            console.error('Error handling seen status:', error);
        }
    });


    // Handle disconnection
    socket.on('disconnect', () => {
        if (user) {
            onlineUser.delete(user._id.toString());
            io.emit('onlineUser', Array.from(onlineUser));
        }
        console.log('User disconnected: ', socket.id);
    });
});

module.exports = {
    app,
    io,
    server
};

