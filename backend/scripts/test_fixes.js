const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('1. Logging in as Super Admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@saas.com',
                password: 'Admin@123'
            })
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) throw new Error(loginData.message);

        const token = loginData.token;
        console.log('Logged in.');

        console.log('2. Creating Company with Plan "Pro"...');
        const companyName = `FixTest Company ${Date.now()}`;

        const companyRes = await fetch(`${API_URL}/companies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                companyName: companyName,
                ownerName: 'FixTest Owner',
                ownerEmail: `fixtest_${Date.now()}@test.com`,
                ownerPassword: 'password123',
                plan: 'Pro'
            })
        });
        const companyData = await companyRes.json();
        if (!companyRes.ok) throw new Error(companyData.message);

        const companyId = companyData.company._id;
        const ownerId = companyData.owner._id;
        console.log(`Company Created: ${companyId}`);
        console.log(`Plan: ${companyData.company.plan}`);

        if (companyData.company.plan !== 'Pro') {
            throw new Error(`Plan Mismatch! Expected 'Pro', got '${companyData.company.plan}'`);
        }
        console.log('SUCCESS: Plan "Pro" was correctly saved.');

        console.log('3. Deleting Company...');
        const deleteRes = await fetch(`${API_URL}/companies/${companyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const deleteData = await deleteRes.json();
        if (!deleteRes.ok) throw new Error(deleteData.message);

        console.log('Delete Response:', deleteData.message);

        console.log('4. Verifying User Deletion...');
        const ownerLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: companyData.owner.email,
                password: 'password123'
            })
        });
        if (ownerLoginRes.ok) {
            throw new Error('FAILURE: User still exists and can login!');
        } else {
            const errorData = await ownerLoginRes.json();
            console.log(`SUCCESS: User login failed as expected (${errorData.message}).`);
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
};

runTest();
