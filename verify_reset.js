const fs = require('fs');
const path = require('path');
const http = require('http');

const C_FOLDER = path.join(__dirname, 'Timetable_DSA');
const REACT_PUBLIC = path.join(__dirname, 'scheduler-frontend/public');
const BACKEND_FOLDER = path.join(__dirname, 'backend');

const testFiles = [
    path.join(C_FOLDER, 'data.json'),
    path.join(C_FOLDER, 'config.txt'),
    path.join(C_FOLDER, 'locked.txt'),
    path.join(REACT_PUBLIC, 'data.json'),
    path.join(BACKEND_FOLDER, 'daily_overrides.json')
];

// 1. Create dummy files
console.log("Creating dummy test files...");
testFiles.forEach(f => {
    if (!fs.existsSync(path.dirname(f))) fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, "test data");
});

// 2. Call Reset API
console.log("Calling System Reset API...");
const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/system-reset',
    method: 'DELETE'
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log("Response:", data);

        // 3. Verify Deletion
        console.log("Verifying deletion...");
        let failed = false;
        testFiles.forEach(f => {
            // daily_overrides.json should exist but be empty array
            if (f.includes('daily_overrides.json')) {
                const content = fs.readFileSync(f, 'utf8');
                if (content !== '[]') {
                    console.error(`[x] Failed: ${path.basename(f)} should be [], found ${content}`);
                    failed = true;
                } else {
                    console.log(`[✓] Verified: ${path.basename(f)} is reset.`);
                }
            } else {
                if (fs.existsSync(f)) {
                    console.error(`[x] Failed: ${path.basename(f)} still exists.`);
                    failed = true;
                } else {
                    console.log(`[✓] Verified: ${path.basename(f)} deleted.`);
                }
            }
        });

        if (!failed) console.log("SUCCESS: System Reset Verified.");
        else console.error("FAILURE: System Reset Incomplete.");
    });
});

req.on('error', (e) => console.error("Request Error:", e));
req.end();
