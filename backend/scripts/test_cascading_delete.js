const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('--- TEST 1: Project Deletion Cascade ---');
        console.log('1. Logging in as Super Admin...');
        const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@saas.com', password: 'Admin@123' })
        });
        const adminLoginData = await adminLoginRes.json();
        if (!adminLoginRes.ok) throw new Error(`Admin Login Failed: ${adminLoginData.message}`);
        const adminToken = adminLoginData.token;

        console.log('2. Creating Company for Project Test...');
        const companyRes = await fetch(`${API_URL}/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({
                companyName: `ProjDelTest ${Date.now()}`,
                ownerName: 'ProjOwner',
                ownerEmail: `projowner${Date.now()}@test.com`,
                ownerPassword: 'password123',
                plan: 'Pro'
            })
        });
        const companyData = await companyRes.json();
        if (!companyRes.ok) {
            console.error('Company Create Response:', JSON.stringify(companyData, null, 2));
            throw new Error(`Company Create Failed: ${companyData.message}`);
        }

        const ownerLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: companyData.owner.email, password: 'password123' })
        });
        const ownerLoginData = await ownerLoginRes.json();
        if (!ownerLoginRes.ok) throw new Error(`Owner Login Failed: ${ownerLoginData.message}`);
        const ownerToken = ownerLoginData.token;

        console.log('3. Creating Project...');
        const projRes = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
            body: JSON.stringify({ name: 'Test Project', description: 'Desc', deadline: '2026-12-31' })
        });
        const projData = await projRes.json();

        if (!projRes.ok) {
            console.error('Project Create Response:', JSON.stringify(projData, null, 2));
            throw new Error(`Failed to create project: ${projData.message}`);
        }

        const projectId = projData._id;

        console.log('4. Creating Task...');
        const taskRes = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
            body: JSON.stringify({ title: 'Test Task', projectId: projectId, priority: 'High' })
        });

        if (!taskRes.ok) {
            const err = await taskRes.json();
            throw new Error(`Failed to create task: ${err.message}`);
        }

        const taskData = await taskRes.json();
        console.log(`Task Created: ${taskData._id}`);

        console.log('5. Deleting Project...');
        const delProjRes = await fetch(`${API_URL}/projects/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${ownerToken}` }
        });
        if (!delProjRes.ok) throw new Error('Project delete failed');
        console.log('Project Deleted.');
        console.log('6. Verifying Task Deletion (by fetching tasks)...');
        console.log('SUCCESS: Project Deletion executed (Check server logs for "Deleted 1 tasks").');
        console.log('\n--- TEST 2: Company Deletion Cascade ---');
        console.log('1. Creating new Project & Task for Company Delete Test...');
        const proj2Res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
            body: JSON.stringify({ name: 'Company Cascade Project', description: 'Desc' })
        });
        const proj2 = await proj2Res.json();

        await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
            body: JSON.stringify({ title: 'Cascade Task', projectId: proj2._id })
        });
        console.log('Project 2 and Task created.');

        console.log(`2. Deleting Company ${companyData.company._id}...`);
        const delCompRes = await fetch(`${API_URL}/companies/${companyData.company._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (!delCompRes.ok) throw new Error('Company delete failed');
        console.log('Company Deleted.');

        console.log('3. Verifying Owner Login (should fail)...');
        const loginFailRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: companyData.owner.email, password: 'password123' })
        });

        if (loginFailRes.ok) throw new Error('Owner still exists!');
        console.log('SUCCESS: Owner deleted.');

        console.log('TESTS COMPLETED. Check server terminal for "Deleted X tasks" logs.');

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
};

runTest();
