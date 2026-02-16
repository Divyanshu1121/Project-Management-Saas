const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('--- TEST: Secure Company Deletion ---');

        // 1. Login as Admin
        console.log('1. Logging in as Super Admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@saas.com', password: 'Admin@123' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message);
        const token = loginData.token;

        // 2. Create Company
        console.log('2. Creating Company to delete...');
        const companyRes = await fetch(`${API_URL}/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                companyName: `DelTest ${Date.now()}`,
                ownerName: 'Test Owner',
                ownerEmail: `del${Date.now()}@test.com`,
                ownerPassword: 'password123',
                plan: 'Free'
            })
        });
        const companyData = await companyRes.json();
        if (!companyRes.ok) throw new Error(companyData.message);
        const companyId = companyData.company._id;
        console.log(`Company Created: ${companyId}`);

        // 3. Attempt Delete WITHOUT password
        console.log('3. Attempting Delete WITHOUT password (should fail)...');
        const failRes1 = await fetch(`${API_URL}/companies/${companyId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({}) // Empty body
        });
        const failData1 = await failRes1.json();
        console.log(`Response: ${failRes1.status} - ${failData1.message}`);
        if (failRes1.ok) throw new Error('Delete allowed without password!');

        // 4. Attempt Delete with WRONG password
        console.log('4. Attempting Delete with WRONG password (should fail)...');
        const failRes2 = await fetch(`${API_URL}/companies/${companyId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ password: 'wrongpassword' })
        });
        const failData2 = await failRes2.json();
        console.log(`Response: ${failRes2.status} - ${failData2.message}`);
        if (failRes2.ok) throw new Error('Delete allowed with wrong password!');

        // 5. Attempt Delete with CORRECT password
        console.log('5. Attempting Delete with CORRECT password (should succeed)...');
        const successRes = await fetch(`${API_URL}/companies/${companyId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ password: 'Admin@123' }) // Correct admin password
        });
        const successData = await successRes.json();
        console.log(`Response: ${successRes.status} - ${successData.message}`);

        if (!successRes.ok) throw new Error(`Delete failed with correct password: ${successData.message}`);

        console.log('SUCCESS: Secure Deletion Verified.');

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
};

runTest();
