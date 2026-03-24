/**
 * scripts/cleanOrphanData.js
 *
 * One-time cleanup script to remove orphan users, projects, tasks, and teams
 * whose companyId does not belong to any existing (non-deleted) company.
 *
 * Run: node scripts/cleanOrphanData.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const Company = require('../models/Company');
const User    = require('../models/User');
const Project = require('../models/Project');
const Task    = require('../models/Task');
const Team    = require('../models/Team');
const Sprint  = require('../models/Sprint');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('❌  MONGO_URI not found in .env. Aborting.');
    process.exit(1);
}

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to MongoDB:', mongoose.connection.name);

    // ── Step 1: Collect all valid company IDs ──────────────────────────────
    const validCompanies = await Company.find({ isDeleted: { $ne: true } }).select('_id name companyName');
    const validIds = validCompanies.map(c => c._id);

    console.log(`\n📋  Valid companies in DB: ${validIds.length}`);
    validCompanies.forEach(c => console.log(`   • ${c.companyName || c.name} (${c._id})`));

    if (validIds.length === 0) {
        console.warn('\n⚠️  No valid companies found. Aborting to avoid wiping everything.');
        await mongoose.disconnect();
        process.exit(0);
    }

    // ── Step 2: Find orphan counts before deletion ─────────────────────────
    const orphanUserCount = await User.countDocuments({
        role: { $nin: ['superadmin', 'SUPER_ADMIN'] },
        company: { $nin: validIds },
        companyId: { $nin: validIds }
    });
    const orphanProjectCount = await Project.countDocuments({ companyId: { $nin: validIds } });
    const orphanTaskCount    = await Task.countDocuments({ companyId: { $nin: validIds } });
    const orphanTeamCount    = await Team.countDocuments({ companyId: { $nin: validIds } });

    console.log('\n🔍  Orphan documents found:');
    console.log(`   • Users    : ${orphanUserCount}`);
    console.log(`   • Projects : ${orphanProjectCount}`);
    console.log(`   • Tasks    : ${orphanTaskCount}`);
    console.log(`   • Teams    : ${orphanTeamCount}`);

    if (orphanUserCount + orphanProjectCount + orphanTaskCount + orphanTeamCount === 0) {
        console.log('\n✅  No orphan data found. DB is clean!');
        await mongoose.disconnect();
        return;
    }

    // ── Step 3: Delete orphan tasks ────────────────────────────────────────
    const taskDel = await Task.deleteMany({ companyId: { $nin: validIds } });
    console.log(`\n🗑️   Deleted ${taskDel.deletedCount} orphan tasks`);

    // ── Step 4: Delete sprints for orphan projects ─────────────────────────
    const orphanProjects = await Project.find({ companyId: { $nin: validIds } }).select('_id');
    const orphanProjectIds = orphanProjects.map(p => p._id);
    if (orphanProjectIds.length > 0) {
        const sprintDel = await Sprint.deleteMany({ projectId: { $in: orphanProjectIds } });
        console.log(`🗑️   Deleted ${sprintDel.deletedCount} orphan sprints`);
    }

    // ── Step 5: Delete orphan projects ────────────────────────────────────
    const projectDel = await Project.deleteMany({ companyId: { $nin: validIds } });
    console.log(`🗑️   Deleted ${projectDel.deletedCount} orphan projects`);

    // ── Step 6: Delete orphan teams ────────────────────────────────────────
    const teamDel = await Team.deleteMany({ companyId: { $nin: validIds } });
    console.log(`🗑️   Deleted ${teamDel.deletedCount} orphan teams`);

    // ── Step 7: Delete orphan users (preserve super admins AND owners) ────────────────
    const userDel = await User.deleteMany({
        role: { $nin: ['superadmin', 'SUPER_ADMIN', 'owner', 'COMPANY_OWNER'] },
        company: { $nin: validIds },
        companyId: { $nin: validIds }
    });
    console.log(`🗑️   Deleted ${userDel.deletedCount} orphan users`);

    // ── Step 8: Verify ─────────────────────────────────────────────────────
    const remainingOrphans = await User.countDocuments({
        role: { $nin: ['superadmin', 'SUPER_ADMIN', 'owner', 'COMPANY_OWNER'] },
        company: { $nin: validIds },
        companyId: { $nin: validIds }
    });

    console.log('\n✅  Cleanup complete!');
    console.log(`   Remaining orphan users (should be 0): ${remainingOrphans}`);

    await mongoose.disconnect();
    console.log('🔌  Disconnected from MongoDB.');
}

run().catch(err => {
    console.error('❌  Script failed:', err);
    mongoose.disconnect();
    process.exit(1);
});
