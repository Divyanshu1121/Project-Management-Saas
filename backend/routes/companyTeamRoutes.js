const express = require('express');
const router = express.Router();
const { createTeam, getTeams, deleteTeam, addMember, removeMember, updateEmployee, updateTeam } = require('../controllers/companyTeamController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const leadershipRoles = ['COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO', 'VP', 'HR'];

router.route('/')
    .post(protect, roleCheck(leadershipRoles), createTeam)
    .get(protect, roleCheck([...leadershipRoles, 'PROJECT_MANAGER']), getTeams);

router.route('/:id')
    .delete(protect, roleCheck(leadershipRoles), deleteTeam)
    .put(protect, roleCheck(leadershipRoles), updateTeam);

router.route('/:id/members')
    .post(protect, roleCheck(leadershipRoles), addMember);

router.route('/:id/members/:userId')
    .delete(protect, roleCheck(leadershipRoles), removeMember);

router.route('/employee/:id')
    .put(protect, roleCheck(leadershipRoles), updateEmployee);

module.exports = router;
