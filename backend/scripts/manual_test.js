const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('1. Logging in as Super Admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@platform.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) throw new Error(loginData.message);

        const token = loginData.token;
        console.log('Logged in. Token received.');

        console.log('2. Creating Company...');
        const companyName = `Test Company ${Date.now()}`;
        const ownerEmail = `owner${Date.now()}@test.com`;

        const companyRes = await fetch(`${API_URL}/companies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                companyName: companyName,
                ownerName: 'Test Owner',
                ownerEmail: ownerEmail,
                ownerPassword: 'password123',
                plan: 'Basic'
            })
        });
        const companyData = await companyRes.json();

        if (!companyRes.ok) throw new Error(companyData.message);

        console.log('Company Created:', companyData.company.name);
        console.log('Success Message:', companyData.message || 'No message received');
        console.log('Company ID:', companyData.company._id);

        console.log('3. Logging in as New Company Owner...');
        const ownerLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: ownerEmail,
                password: 'password123'
            })
        });
        const ownerLoginData = await ownerLoginRes.json();

        if (!ownerLoginRes.ok) throw new Error(ownerLoginData.message);

        const ownerToken = ownerLoginData.token;
        console.log('Logged in as Owner.');

        console.log('4. Creating Project Manager...');
        const pmRes = await fetch(`${API_URL}/company/project-manager`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ownerToken}`
            },
            body: JSON.stringify({
                name: 'Test Project Manager',
                email: `pm${Date.now()}@test.com`,
                password: 'password123'
            })
        });
        const pmData = await pmRes.json();

        if (!pmRes.ok) throw new Error(pmData.message);

        console.log('Project Manager Created:', pmData.email);

        console.log('5. Fetching Dashboard Stats...');
        const dashRes = await fetch(`${API_URL}/company/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ownerToken}`
            }
        });
        const dashData = await dashRes.json();

        if (!dashRes.ok) throw new Error(dashData.message);

        console.log('Dashboard Stats:');
        console.log(JSON.stringify(dashData, null, 2));

        if (!dashData.stats.tasksByStatus) {
            throw new Error('tasksByStatus missing from response');
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
};

runTest();
