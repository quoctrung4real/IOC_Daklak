async function test() {
    try {
        console.log('1. Login');
        let token = null;
        const loginRes = await fetch('http://localhost:5100/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: 'testadmin', password: 'password123'})
        });
        const loginData = await loginRes.json();
        console.log('Login:', loginData.success);
        token = loginData.accessToken;

        console.log('2. Create draft');
        const draftRes = await fetch('http://localhost:5100/api/y-kien-du-thao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                documentNumber: 'DT-TEST',
                title: 'Test Draft Opinion'
            })
        });
        const draftData = await draftRes.json();
        console.log('Draft Create:', draftData);

        const draftId = draftData.data ? draftData.data.id : (draftData.draftOpinion ? draftData.draftOpinion.id : 1);
        console.log('Draft ID:', draftId);

        console.log('3. Submit feedback');
        const fbRes = await fetch('http://localhost:5100/api/gop-y', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                draftOpinionId: draftId,
                fullName: 'Test User',
                email: 'test@test.com',
                content: 'This is a test feedback'
            })
        });
        const fbData = await fbRes.json();
        console.log('Feedback Create:', fbData);

        console.log('4. List feedbacks');
        const listFbRes = await fetch('http://localhost:5100/api/gop-y', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const listFbData = await listFbRes.json();
        console.log('Feedback List:', listFbData);

        console.log('5. List Drafts');
        const listDrRes = await fetch('http://localhost:5100/api/y-kien-du-thao');
        const listDrData = await listDrRes.json();
        console.log('Draft List:', listDrData);
    } catch (e) {
        console.error(e);
    }
}
test();
