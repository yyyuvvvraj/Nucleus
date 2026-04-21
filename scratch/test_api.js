const axios = require('axios');

const API_BASE = 'http://localhost:5001/api/admin';
const TOKEN = 'YOUR_TOKEN_HERE'; // Replace with a valid token from your browser devtools

async function testUpdateMenu() {
    try {
        console.log('Testing Mess Menu Update...');
        const res = await axios.post(`${API_BASE}/mess-menu`, {
            day: 'Monday',
            breakfast: 'Test Breakfast',
            lunch: 'Test Lunch',
            dinner: 'Test Dinner',
            special: 'Test Special'
        }, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Failure:', err.response ? err.response.data : err.message);
    }
}

// testUpdateMenu();
