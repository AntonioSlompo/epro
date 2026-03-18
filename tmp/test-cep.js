
async function testCep() {
    const cep = '01310-200';
    const cleanCep = cep.replace(/\D/g, '');
    
    console.log('--- Testing V2 ---');
    try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
        console.log('Status V2:', response.status);
        const data = await response.json();
        console.log('Data V2:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error V2:', e.message);
    }

    console.log('\n--- Testing V1 ---');
    try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
        console.log('Status V1:', response.status);
        const data = await response.json();
        console.log('Data V1:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error V1:', e.message);
    }
}

testCep();
