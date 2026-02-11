const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.text()); // To parse text input
app.use(express.json()); // To parse JSON bodies

// Helper: On Linux (Render), increase stack size for recursive C solver
const wrapCmd = (cmd) => {
    if (process.platform !== 'win32' && process.platform !== 'darwin') {
        return `ulimit -s unlimited 2>/dev/null; ${cmd}`;
    }
    return cmd;
};

// PATHS (Adjust if your folder names are different)
const C_FOLDER = path.join(__dirname, '../Timetable_DSA');
const REACT_PUBLIC = path.join(__dirname, '../scheduler-frontend/public');
const REACT_BUILD = path.join(__dirname, '../scheduler-frontend/dist');
const DAILY_OVERRIDES_FILE = path.join(__dirname, 'daily_overrides.json');

// Initialize Daily Overrides if not exists
if (!fs.existsSync(DAILY_OVERRIDES_FILE)) {
    fs.writeFileSync(DAILY_OVERRIDES_FILE, JSON.stringify([]));
}

// Helper: Get Day Index from Date (0=Mon, 4=Fri)
const getDayIndex = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay(); // 0=Sun, 1=Mon...
    if (day === 0 || day === 6) return -1; // Weekend
    return day - 1; // Mon=0, Fri=4
};

app.post('/api/run-engine', (req, res) => {
    console.log(">> Received Timetable Configuration...");

    // 1. Write config.txt to C Folder
    const configPath = path.join(C_FOLDER, 'config.txt');
    try {
        fs.writeFileSync(configPath, req.body);
        console.log("   [✓] Config file saved.");
    } catch (err) {
        return res.status(500).json({ error: "Failed to save config file" });
    }

    // 3. Run the C executable
    const exeName = process.platform === 'win32' ? 'timetable_system.exe' : 'timetable_system';
    const exePath = path.join(C_FOLDER, exeName);
    console.log(">> [Server] Executing C Engine...");

    // PERSISTENCE: Read existing data.json to extract locks
    try {
        const lockedPath = path.join(C_FOLDER, 'locked.txt');
        const sourceJSON = path.join(C_FOLDER, 'data.json'); // Use C folder source
        let lockContent = "";

        if (fs.existsSync(sourceJSON)) {
            const raw = fs.readFileSync(sourceJSON, 'utf8');
            const data = JSON.parse(raw);

            const extractLocks = (node, branch = "", sem = "") => {
                let currentBranch = branch;
                let currentSem = sem;

                if (node.type === 1) currentBranch = node.name; // Branch
                if (node.type === 2) currentSem = node.name;    // Semester

                if (node.type === 3 && node.grid) { // Section
                    node.grid.forEach((row, d) => {
                        row.forEach((cell, s) => {
                            // DEBUG: Log first few cells in each section
                            if (d === 0 && s < 2) {
                                console.log(`   [DEBUG] Cell [${d}][${s}] in ${node.name}:`, JSON.stringify(cell), "isFixed type:", typeof cell.isFixed);
                            }

                            if (cell && typeof cell === 'object' && cell.isFixed) {
                                console.log(`   [DEBUG] Found Locked Slot: ${node.name} [${d}][${s}] -> ${cell.content}`);
                                // Format: Branch|Sem|Sec|Day|Slot|Content
                                // Escape newlines for file format
                                const safeContent = cell.content.replace(/\n/g, "\\n");
                                lockContent += `${currentBranch}|${currentSem}|${node.name}|${d}|${s}|${safeContent}\n`;
                            }
                        });
                    });
                }

                if (node.children) {
                    node.children.forEach(child => extractLocks(child, currentBranch, currentSem));
                }
            };

            console.log(`   [DEBUG] Scanning data.json for locks...`);
            extractLocks(data);
            console.log(`   [DEBUG] Scan complete. Found ${lockContent.split('\n').filter(l => l).length} locks.`);
        }

        fs.writeFileSync(lockedPath, lockContent);
        console.log(`   [✓] Locks preserved: ${lockContent.split('\n').filter(l => l).length} slots.`);

    } catch (e) {
        console.error("Failed to process locked.txt:", e);
    }

    // Run C Engine
    console.log(`>> [Server] Executing: "${exePath}" config.txt (cwd: ${C_FOLDER})`);
    console.log(`>> [Server] Binary exists: ${fs.existsSync(exePath)}`);
    exec(wrapCmd(`"${exePath}" config.txt`), { cwd: C_FOLDER, shell: '/bin/sh' }, (error, stdout, stderr) => {
        if (error) {
            console.error(`   [x] Exec Error: ${error.message}`);
            console.error(`   [x] Exit Code: ${error.code}`);
            console.error(`   [x] Signal: ${error.signal}`);
            console.error(`   [x] stdout: ${stdout}`);
            console.error(`   [x] stderr: ${stderr}`);
            if (error.code === 1) {
                return res.status(422).json({
                    success: false,
                    error: "Scheduling Failed: Not enough free slots or hard constraint violation."
                });
            }
            return res.status(500).json({ error: "C Engine crashed", details: stderr || error.message });
        }

        console.log("   [✓] C Engine finished.");

        // Move data.json to React Public Folder
        const sourceJSON = path.join(C_FOLDER, 'data.json');
        const destJSON = path.join(REACT_PUBLIC, 'data.json');

        try {
            if (fs.existsSync(sourceJSON)) {
                fs.copyFileSync(sourceJSON, destJSON);
                console.log("   [✓] Synced data.json to Frontend.");
                res.json({ success: true, message: "Timetable Updated Successfully!" });
            } else {
                res.status(500).json({ error: "data.json was not generated by C engine." });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to move output file." });
        }
    });
});

// NEW: Booking Endpoint
app.post('/api/book-slot', async (req, res) => {
    const { branch, sem, section, day, slot, subject, type, teacher } = req.body;
    console.log(`>> [Booking Request] ${branch} ${sem} ${section} D${day} S${slot} : ${subject} (${teacher})`);

    // 1. Ensure locks are up to date
    try {
        await new Promise((resolve, reject) => {
            exec('node ../extract_locks.js', { cwd: __dirname }, (err) => {
                if (err) reject(err); else resolve();
            });
        });
    } catch (e) {
        return res.status(500).json({ error: "Failed to sync locks." });
    }

    // 2. Run C Validation
    const exeName = process.platform === 'win32' ? 'timetable_system.exe' : 'timetable_system';
    const exePath = path.join(C_FOLDER, exeName);

    // Command: validate config.txt locked.txt <args...>
    // Note: We use existing config.txt. If that's not safe, we should save a temp one, but for now it's okay.
    const cmd = `"${exePath}" validate config.txt locked.txt "${branch}" "${sem}" "${section}" ${day} ${slot} "${subject}" "${type}" "${teacher}"`;

    exec(wrapCmd(cmd), { cwd: C_FOLDER, shell: '/bin/sh' }, (error, stdout, stderr) => {
        if (error) {
            // Exit codes 1, 2, 3 are handled here
            if (error.code === 1) return res.status(409).json({ success: false, error: "Slot is NOT FREE." });
            if (error.code === 2) return res.status(409).json({ success: false, error: `Teacher ${teacher} is BUSY.` });
            if (error.code === 3) return res.status(400).json({ success: false, error: "Invalid Slot (Break) or Parameters." });

            console.error("Exec Error:", stderr);
            return res.status(500).json({ error: "Internal Error", details: stderr });
        }

        // 3. Success (Exit Code 0)
        // Data.json is already updated by C engine.
        // We need to sync it to React
        const sourceJSON = path.join(C_FOLDER, 'data.json');
        const destJSON = path.join(REACT_PUBLIC, 'data.json');
        fs.copyFileSync(sourceJSON, destJSON);

        res.json({ success: true, message: "Slot Booked Successfully!" });
    });
});


// NEW: Book Extra Slot (Date Specific)
app.post('/api/book-extra-slot', async (req, res) => {
    const { date, branch, sem, section, slot, subject, type, teacher, requester } = req.body;
    const dayIndex = getDayIndex(date);

    if (dayIndex === -1) return res.status(400).json({ error: "Cannot book on Weekends." });

    console.log(`>> [Extra Slot Request] ${date} (D${dayIndex}) S${slot} : ${subject} (${teacher})`);

    // 1. Check Daily Overrides for collisions
    let overrides = [];
    try {
        overrides = JSON.parse(fs.readFileSync(DAILY_OVERRIDES_FILE));
    } catch (e) { overrides = []; }

    const conflict = overrides.find(o =>
        o.date === date &&
        o.branch === branch &&
        o.sem === sem &&
        o.section === section &&
        o.slot === slot
    );

    if (conflict) {
        return res.status(409).json({ error: `Slot already booked by ${conflict.requester} for ${conflict.subject}` });
    }

    // 2. Run C Validation (Master Schedule Check) using 'check_slot'
    const exeName = process.platform === 'win32' ? 'timetable_system.exe' : 'timetable_system';
    const exePath = path.join(C_FOLDER, exeName);

    // Ensure locks are up to date
    try {
        await new Promise((resolve, reject) => exec('node ../extract_locks.js', { cwd: __dirname }, (err) => err ? reject(err) : resolve()));
    } catch (e) { return res.status(500).json({ error: "Lock Sync Failed" }); }

    // Command: check_slot config.txt locked.txt <args...>
    const cmd = `"${exePath}" check_slot config.txt locked.txt "${branch}" "${sem}" "${section}" ${dayIndex} ${slot} "${subject}" "${type}" "${teacher}"`;

    exec(wrapCmd(cmd), { cwd: C_FOLDER, shell: '/bin/sh' }, (error, stdout, stderr) => {
        if (error) {
            if (error.code === 1) return res.status(409).json({ success: false, error: "Slot is NOT FREE in Master Schedule." });
            if (error.code === 2) return res.status(409).json({ success: false, error: `Teacher ${teacher} is BUSY in Master Schedule.` });
            if (error.code === 3) return res.status(400).json({ success: false, error: "Invalid Slot (Break) or Parameters." });
            return res.status(500).json({ error: "Internal Error", details: stderr });
        }

        // 3. Success -> Save to Daily Overrides
        const newOverride = {
            id: Date.now(),
            date, branch, sem, section, day: dayIndex, slot, subject, type, teacher, requester,
            timestamp: new Date().toISOString()
        };

        overrides.push(newOverride);
        fs.writeFileSync(DAILY_OVERRIDES_FILE, JSON.stringify(overrides, null, 2));

        res.json({ success: true, message: "Extra Slot Booked Successfully!" });
    });
});

// NEW: Swap Request (Atomic)
app.post('/api/swap-request', async (req, res) => {
    const { date, branch, sem, section, slotA, teacherA, slotB, teacherB, subjectA, subjectB, requester } = req.body;
    const dayIndex = getDayIndex(date);

    if (dayIndex === -1) return res.status(400).json({ error: "Cannot swap on Weekends." });

    console.log(`>> [Swap Request] ${date}: ${teacherA} (S${slotA}) <-> ${teacherB} (S${slotB})`);

    // 1. Validation: Is Teacher A free at Slot B? Is Teacher B free at Slot A?
    // We strictly check the Master Schedule via C Engine.

    const exeName = process.platform === 'win32' ? 'timetable_system.exe' : 'timetable_system';
    const exePath = path.join(C_FOLDER, exeName);

    // Ensure locks are up to date
    try { await new Promise((resolve, reject) => exec('node ../extract_locks.js', { cwd: __dirname }, (err) => err ? reject(err) : resolve())); }
    catch (e) { return res.status(500).json({ error: "Lock Sync Failed" }); }

    // Check 1: Can Teacher A take Slot B?
    // check_availability args: config locked teacher day slot
    const checkA = `"${exePath}" check_availability config.txt locked.txt "${teacherA}" ${dayIndex} ${slotB}`;

    // Check 2: Can Teacher B take Slot A?
    const checkB = `"${exePath}" check_availability config.txt locked.txt "${teacherB}" ${dayIndex} ${slotA}`;

    // Execute sequentially
    exec(wrapCmd(checkA), { cwd: C_FOLDER, shell: '/bin/sh' }, (err1, stdout1, stderr1) => {
        if (err1 && err1.code !== 0) {
            const msg = err1.code === 2 ? "is BUSY elsewhere" : "cannot take the slot";
            return res.status(409).json({ error: `Swap Failed: ${teacherA} ${msg} at Slot ${slotB}.` });
        }

        exec(wrapCmd(checkB), { cwd: C_FOLDER, shell: '/bin/sh' }, (err2, stdout2, stderr2) => {
            if (err2 && err2.code !== 0) {
                const msg = err2.code === 2 ? "is BUSY elsewhere" : "cannot take the slot";
                return res.status(409).json({ error: `Swap Failed: ${teacherB} ${msg} at Slot ${slotA}.` });
            }

            // 2. Success -> Log *TWO* overrides
            let overrides = [];
            try { overrides = JSON.parse(fs.readFileSync(DAILY_OVERRIDES_FILE)); } catch (e) { overrides = []; }
            const ts = new Date().toISOString();

            // Override 1: Slot B has Teacher A
            overrides.push({ id: Date.now(), date, branch, sem, section, day: dayIndex, slot: slotB, subject: subjectA, type: "Swap", teacher: teacherA, requester, timestamp: ts });

            // Override 2: Slot A has Teacher B
            overrides.push({ id: Date.now() + 1, date, branch, sem, section, day: dayIndex, slot: slotA, subject: subjectB, type: "Swap", teacher: teacherB, requester, timestamp: ts });

            fs.writeFileSync(DAILY_OVERRIDES_FILE, JSON.stringify(overrides, null, 2));
            res.json({ success: true, message: "Swap Confirmed!" });
        });
    });
});

// NEW: Get Overrides for a specific Teacher (for Dashboard)
app.get('/api/daily-overrides', (req, res) => {
    try {
        const data = fs.readFileSync(DAILY_OVERRIDES_FILE);
        res.json(JSON.parse(data));
    } catch (e) { res.json([]); }
});

// NEW: System Reset (Hard Clean)
app.delete('/api/system-reset', (req, res) => {
    console.log(">> [System] Performing Hard Reset...");
    try {
        const filesToDelete = [
            path.join(C_FOLDER, 'data.json'),
            path.join(C_FOLDER, 'config.txt'),
            path.join(C_FOLDER, 'locked.txt'),
            path.join(REACT_PUBLIC, 'data.json'),
            DAILY_OVERRIDES_FILE
        ];

        filesToDelete.forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
                console.log(`   [✓] Deleted: ${path.basename(file)}`);
            }
        });

        // Re-initialize overrides file
        fs.writeFileSync(DAILY_OVERRIDES_FILE, JSON.stringify([]));

        res.json({ success: true, message: "System Reset Complete." });
    } catch (e) {
        console.error("Reset Failed:", e);
        res.status(500).json({ error: "Failed to reset system." });
    }
});
// --- PRODUCTION: Serve data.json from C_FOLDER ---
app.get('/data.json', (req, res) => {
    const dataPath = path.join(C_FOLDER, 'data.json');
    if (fs.existsSync(dataPath)) {
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(dataPath);
    } else {
        res.status(404).json({ error: 'No schedule generated yet.' });
    }
});

// --- PRODUCTION: Serve React Build ---
app.use(express.static(REACT_BUILD));

// Catch-all: Send React index.html for client-side routing
app.get('/{*path}', (req, res) => {
    const indexPath = path.join(REACT_BUILD, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend not built. Run: npm run build');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));