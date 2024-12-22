const { ConversationModel, MessageModel } = require("../models/ConversationModel");
const Group = require("../models/GroupModel");

const getGroupMessages = async (groupId) => {
    return await MessageModel.find({ groupId })
        .sort({ createdAt: -1 })
        .populate('msgByUserId', 'name profile_pic');
};

const getConversation = async (currentUserId) => {
    if (currentUserId) {
        // Fetch user-to-user conversations
        const userConversations = await ConversationModel.find({
            "$or": [
                { sender: currentUserId },
                { receiver: currentUserId }
            ]
        }).sort({ updatedAt: -1 }).populate('messages').populate('sender').populate('receiver');

        // Fetch group conversations
        const groupConversations = await Group.find({ members: currentUserId }).populate('members');

        const conversations = [];

        // Process user-to-user conversations
        userConversations.forEach((conv) => {
            const countUnseenMsg = conv?.messages?.reduce((preve, curr) => {
                const msgByUserId = curr?.msgByUserId?.toString();
                if (msgByUserId !== currentUserId) {
                    return preve + (curr?.seen ? 0 : 1);
                } else {
                    return preve;
                }
            }, 0);

            conversations.push({
                _id: conv?._id,
                sender: conv?.sender,
                receiver: conv?.receiver,
                unseenMsg: countUnseenMsg,
                lastMsg: conv.messages[conv?.messages?.length - 1],
                type: 'user'
            });
        });

        // Process group conversations
        for (const group of groupConversations) {
            const groupMessages = await getGroupMessages(group._id);
            const countUnseenMsg = groupMessages.reduce((preve, curr) => {
                const msgByUserId = curr?.msgByUserId?.toString();
                if (msgByUserId !== currentUserId) {
                    return preve + (curr?.seen ? 0 : 1);
                } else {
                    return preve;
                }
            }, 0);

            conversations.push({
                _id: group._id,
                name: group.name,
                members: group.members,
                unseenMsg: countUnseenMsg,
                lastMsg: groupMessages[0],
                type: 'group'
            });
        }

        // Sort all conversations by the last message's timestamp (updatedAt)
        // conversations.sort((a, b) => new Date(b.lastMsg.createdAt) - new Date(a.lastMsg.createdAt));

        return conversations;
    } else {
        return []
    }
}

module.exports = getConversation