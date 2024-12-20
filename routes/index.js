const express = require('express')
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
router.get('/user-details', userDetails)
//logout user
router.get('/logout', logout)
//update user details
router.post('/update-user', updateUserDetails)
//search user
router.post("/search-user", searchUser)

// group create
router.post("/create-group", createGroup)
// group create
router.get("/groups", getAllGroups)

// Get a group by ID
router.get('/group/:id', getGroupById);

// Add a member to a group
router.post('/group/add-member/:id', addMemberToGroup);

// Remove a member from a group
router.post('/group/remove-member/:id', removeMemberFromGroup);

// Delete a group
router.delete('/delete-group/:id', deleteGroup);

// Update group details
router.put('/update-group/:id', updateGroup);

module.exports = router;