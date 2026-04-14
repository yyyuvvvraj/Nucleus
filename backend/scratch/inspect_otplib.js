const otplib = require('otplib');
const secret = otplib.generateSecret();
console.log('Generated Secret:', secret);
const token = otplib.generateSync ? otplib.generateSync({ secret }) : 'N/A';
console.log('Generated Token:', token);

async function test() {
    try {
        const isValidSync = otplib.verifySync ? otplib.verifySync({ token, secret }) : 'No verifySync';
        console.log('VerifySync result:', isValidSync);
        
        const isValidAsync = otplib.verify ? await otplib.verify({ token, secret }) : 'No verify';
        console.log('Verify result:', isValidAsync);
    } catch (e) {
        console.log('Error testing verify:', e.message);
        
        try {
           console.log('Trying positional verify...');
           const isValidPos = otplib.verify(token, secret);
           console.log('Positional verify result:', isValidPos);
        } catch (e2) {
           console.log('Positional verify failed:', e2.message);
        }
    }
}
test();
