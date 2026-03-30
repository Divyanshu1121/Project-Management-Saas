const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('--- TEST: Project Manager Creation ---');

        console.log('1. Logging in as Super Admin...');
        const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@saas.com', password: 'Admin@123' })
        });
        const adminToken = (await adminLoginRes.json()).token;

        const companyName = `PMTest Company ${Date.now()}`;
        console.log(`2. Creating Company: ${companyName}...`);
        const companyRes = await fetch(`${API_URL}/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({
                companyName: companyName,
                ownerName: 'PMTest Owner',
                ownerEmail: `pmtestowner${Date.now()}@test.com`,
                ownerPassword: 'password123',
                plan: 'Pro'
            })
        });
        const companyData = await companyRes.json();
        if (!companyRes.ok) throw new Error(`Company Create Failed: ${companyData.message}`);

        console.log('3. Logging in as Company Owner...');
        const ownerLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: companyData.owner.email, password: 'password123' })
        });
        const ownerLoginData = await ownerLoginRes.json();
        const ownerToken = ownerLoginData.token;

        console.log('4. Creating Project Manager...');
        const pmEmail = `pm${Date.now()}@test.com`;
        const pmRes = await fetch(`${API_URL}/company/project-manager`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
            body: JSON.stringify({
                name: 'New Project Manager',
                email: pmEmail,
                password: 'password123'
            })
        });
        const pmData = await pmRes.json();

        if (!pmRes.ok) {
            console.error('PM Create Response:', JSON.stringify(pmData, null, 2));
            throw new Error(`PM Creation Failed: ${pmData.message}`);
        }

        console.log(`Project Manager Created: ${pmData.email} (Role: ${pmData.role})`);

        if (pmData.role !== 'PROJECT_MANAGER') {
            throw new Error('Role mismatch!');
        }

        console.log('5. Verifying PM Login...');
        const pmLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: pmEmail, password: 'password123' })
        });
        const pmLoginData = await pmLoginRes.json();

        if (!pmLoginRes.ok) {
            console.error('PM Login Response:', JSON.stringify(pmLoginData, null, 2));
            throw new Error('PM Login Failed (Password likely not hashed correctly if this fails)');
        }

        console.log('SUCCESS: Project Manager Created and Logged In.');

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
};

runTest();
