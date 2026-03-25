const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const ProjectDoc = require('../models/ProjectDoc');
const Project = require('../models/Project');
const { generateDocAssist } = require('../services/groqService');

const getDoc = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const companyId = req.user.companyId;

        // Verify project existence and access
        const project = await Project.findOne({ _id: id, companyId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        let doc = await ProjectDoc.findOne({ projectId: id, companyId });
        if (!doc) {
            // Lazy initialize empty doc
            doc = await ProjectDoc.create({
                projectId: id,
                companyId,
                overview: '',
                requirements: '',
                plan: '',
                definitionOfDone: '',
                technicalSpecs: '',
                meetingNotes: '',
                risks: '',
                lastUpdatedBy: req.user._id
            });
        }

        res.json(doc);
    } catch (error) {
        console.error('Error fetching project documentation:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateDoc = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const companyId = req.user.companyId;
        const updates = req.body;

        // Note: Route middleware ensures only PM/Owner can reach this
        const project = await Project.findOne({ _id: id, companyId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        updates.lastUpdatedBy = req.user._id;

        const doc = await ProjectDoc.findOneAndUpdate(
            { projectId: id, companyId },
            { $set: updates },
            { returnDocument: 'after', upsert: true }
        );

        res.json(doc);
    } catch (error) {
        console.error('Error updating project documentation:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const aiAssistDoc = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, section, contextText } = req.body;
        // actions: "summarize", "improve", "generate_risks", "generate_reqs"
        
        const project = await Project.findOne({ _id: id });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const result = await generateDocAssist(project.name, action, section, contextText);
        res.json({ result });
    } catch (error) {
        console.error('AI Assistance error:', error);
        res.status(500).json({ message: error.message || 'Error generating AI content' });
    }
};

const uploadAttachment = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const { sectionId } = req.body;
        const companyId = req.user.companyId;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const project = await Project.findOne({ _id: id, companyId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const filePath = `/uploads/docs/${req.file.filename}`;

        const doc = await ProjectDoc.findOneAndUpdate(
            { projectId: id, companyId },
            { 
                $push: { attachments: { url: filePath, name: req.file.originalname, section: sectionId } },
                $set: { lastUpdatedBy: req.user._id }
            },
            { returnDocument: 'after', upsert: true }
        );

        res.json({ doc, fileUrl: filePath, fileName: req.file.originalname, section: sectionId });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteAttachment = async (req, res) => {
    try {
        const { id, attachmentId } = req.params;
        const companyId = req.user.companyId;

        // Find the document first to get the file path
        const docRecord = await ProjectDoc.findOne({ projectId: id, companyId });
        if (!docRecord) return res.status(404).json({ message: 'Document not found' });

        const attachment = docRecord.attachments.find(a => a._id.toString() === attachmentId);
        
        // Remove from database
        const doc = await ProjectDoc.findOneAndUpdate(
            { projectId: id, companyId },
            { 
                $pull: { attachments: { _id: attachmentId } },
                $set: { lastUpdatedBy: req.user._id }
            },
            { returnDocument: 'after' }
        );

        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Physically delete from disk if it exists
        if (attachment && attachment.url) {
            const fullPath = path.join(__dirname, '..', '..', attachment.url);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        res.json({ message: 'Attachment deleted', doc });
    } catch (error) {
        console.error('Delete Attachment Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDoc,
    updateDoc,
    aiAssistDoc,
    uploadAttachment,
    deleteAttachment
};
