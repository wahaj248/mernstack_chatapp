const Group = require("../models/GroupModel");

const createGroup = async (req, res) => {
    const { name, members } = req.body;

    if (!name || !members || members.length === 0) {
        return res.status(400).json({ error: 'Group name and members are required.' });
    }

    try {
        // Check if group name already exists (optional)
        const existingGroup = await Group.findOne({ name });
        if (existingGroup) {
            return res.status(400).json({ error: 'Group name already exists.' });
        }

        // Create a new group
        const newGroup = new Group({
            name,
            members
        });

        // Save the group to the database
        await newGroup.save();

        res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Failed to create group' });
    }

}

const getAllGroups = async (req, res) => {
    try {
        // Fetch all groups from the database
        const groups = await Group.find();

        if (groups.length === 0) {
            return res.status(404).json({ message: 'No groups found' });
        }

        res.status(200).json({ groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to retrieve groups' });
    }
};

const getGroupById = async (req, res) => {
    const { id } = req.params;

    try {
        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json({ group });
    } catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({ error: 'Failed to retrieve group' });
    }
};

const updateGroup = async (req, res) => {
    const { id } = req.params;
    const { name, members } = req.body;

    if (!name && (!members || members.length === 0)) {
        return res.status(400).json({ error: 'Provide at least one field to update (name or members).' });
    }

    try {
        const updatedGroup = await Group.findByIdAndUpdate(
            id,
            { ...(name && { name }), ...(members && { members }) },
            { new: true, runValidators: true }
        );

        if (!updatedGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json({ message: 'Group updated successfully', group: updatedGroup });
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ error: 'Failed to update group' });
    }
};

const deleteGroup = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedGroup = await Group.findByIdAndDelete(id);

        if (!deletedGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Failed to delete group' });
    }
};

const addMemberToGroup = async (req, res) => {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!memberId) {
        return res.status(400).json({ error: 'Member ID is required.' });
    }

    try {
        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (group.members.includes(memberId)) {
            return res.status(400).json({ error: 'Member already in the group.' });
        }

        group.members.push(memberId);
        await group.save();

        res.status(200).json({ message: 'Member added successfully', group });
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
};

const removeMemberFromGroup = async (req, res) => {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!memberId) {
        return res.status(400).json({ error: 'Member ID is required.' });
    }

    try {
        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const memberIndex = group.members.indexOf(memberId);

        if (memberIndex === -1) {
            return res.status(400).json({ error: 'Member not found in the group.' });
        }

        group.members.splice(memberIndex, 1);
        await group.save();

        res.status(200).json({ message: 'Member removed successfully', group });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
};




module.exports = getGroupById;
module.exports = addMemberToGroup;
module.exports = removeMemberFromGroup;
module.exports = deleteGroup;
module.exports = updateGroup;
module.exports = createGroup;
module.exports = getAllGroups;