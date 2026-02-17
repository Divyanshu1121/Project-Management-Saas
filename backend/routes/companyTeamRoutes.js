const express = require('express');
const router = express.Router();
const { createTeam, getTeams, deleteTeam, addMember, removeMember } = require('../controllers/companyTeamController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const leadershipRoles = ['COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO', 'VP'];

router.route('/')
    .post(protect, roleCheck(leadershipRoles), createTeam)
    .get(protect, roleCheck(leadershipRoles), getTeams);

router.route('/:id')
    .delete(protect, roleCheck(leadershipRoles), deleteTeam);

router.route('/:id/members')
    .post(protect, roleCheck(leadershipRoles), addMember);

router.route('/:id/members/:userId')
    .delete(protect, roleCheck(leadershipRoles), removeMember);

module.exports = router;
