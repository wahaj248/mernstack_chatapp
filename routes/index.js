const express = require('express')
const authenticateToken = require('../middleware/protected')
const registerUser = require('../controller/registerUser')
const checkEmail = require('../controller/checkEmail')
const checkPassword = require('../controller/checkPassword')
const userDetails = require('../controller/userDetails')
const logout = require('../controller/logout')
const updateUserDetails = require('../controller/updateUserDetails')
const searchUser = require('../controller/searchUser')
const {
    getGroupById,
    addMemberToGroup,
    removeMemberFromGroup,
    deleteGroup,
    updateGroup,
    createGroup,
    getAllGroups
} = require('../controller/groupController');

const router = express.Router()

//create user api
router.post('/register', registerUser)
//check user email
router.post('/email', checkEmail)
//check user password
router.post('/password', checkPassword)
//login user details
router.get('/user-details', authenticateToken, userDetails)
//logout user
router.get('/logout', authenticateToken, logout)
//update user details
router.post('/update-user', authenticateToken, updateUserDetails)
//search user
router.post("/search-user", authenticateToken, searchUser)

// group create
router.post("/create-group", authenticateToken, createGroup)
// group create
router.get("/groups", authenticateToken, getAllGroups)

// Get a group by ID
router.get('/group/:id', authenticateToken, getGroupById);

// Add a member to a group
router.post('/group/add-member/:id', authenticateToken, addMemberToGroup);

// Remove a member from a group
router.post('/group/remove-member/:id', authenticateToken, removeMemberFromGroup);

// Delete a group
router.delete('/delete-group/:id', authenticateToken, deleteGroup);

// Update group details
router.put('/update-group/:id', authenticateToken, updateGroup);

module.exports = router;