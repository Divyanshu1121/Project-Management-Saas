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

        console.log('2. Creating Company to modify...');
        const companyName = `Mod Company ${Date.now()}`;
        const ownerEmail = `mod_owner${Date.now()}@test.com`;

        const companyRes = await fetch(`${API_URL}/companies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                companyName: companyName,
                ownerName: 'Mod Owner',
                ownerEmail: ownerEmail,
                ownerPassword: 'password123',
                plan: 'Free'
            })
        });
        const companyData = await companyRes.json();
        if (!companyRes.ok) throw new Error(companyData.message);

        const companyId = companyData.company._id;
        console.log(`Company Created: ${companyId} - Plan: ${companyData.company.plan}`);

        console.log('3. Updating Company Plan to "Pro"...');
        const updateRes = await fetch(`${API_URL}/companies/${companyId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                plan: 'Pro'
            })
        });
        const updateData = await updateRes.json();
        if (!updateRes.ok) throw new Error(updateData.message);

        console.log(`Company Updated: ${updateData._id} - New Plan: ${updateData.plan}`);
        if (updateData.plan !== 'Pro') throw new Error('Plan did not update!');

        console.log('4. Deleting Company...');
        const deleteRes = await fetch(`${API_URL}/companies/${companyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const deleteData = await deleteRes.json();
        if (!deleteRes.ok) throw new Error(deleteData.message);

        console.log('Delete Response:', deleteData.message);

        console.log('5. Verifying Deletion (fetching updated company)...');
        // We need to fetch all companies since GET /:id might not be implemented or we can just assume list won't have it
        // Or we can try update again and expect fail
        const verifyRes = await fetch(`${API_URL}/companies/${companyId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ plan: 'Basic' })
        });

        if (verifyRes.ok) {
            console.error('CRITICAL: Company still exists after delete!');
        } else {
            console.log('Verification Success: Company not found (as expected).');
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
};

runTest();
