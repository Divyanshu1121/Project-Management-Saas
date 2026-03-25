const express = require('express');
const router = express.Router();
const { createProject, getProjects, updateProject, deleteProject } = require('../controllers/projectController');
const { getDoc, updateDoc, aiAssistDoc, uploadAttachment, deleteAttachment } = require('../controllers/docController');
const uploadDoc = require('../middleware/uploadDoc');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const managerOrOwner = roleCheck(['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO', 'PROJECT_MANAGER', 'admin', 'ADMIN']);

router.post('/', protect, managerOrOwner, createProject);
router.get('/', protect, managerOrOwner, getProjects);
router.put('/:id', protect, managerOrOwner, updateProject);
router.delete('/:id', protect, managerOrOwner, deleteProject);

// Documentation Routes
router.get('/:id/docs', protect, getDoc); // Anyone in company (or matched by project) can view
router.put('/:id/docs', protect, managerOrOwner, updateDoc); // Only PM/Owner can edit
router.post('/:id/docs/ai', protect, managerOrOwner, aiAssistDoc);
router.post('/:id/docs/upload', protect, managerOrOwner, uploadDoc.single('file'), uploadAttachment);
router.delete('/:id/docs/attachments/:attachmentId', protect, managerOrOwner, deleteAttachment);

module.exports = router;
