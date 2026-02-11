const fs = require('fs');
const path = require('path');

const DATA_JSON_PATH = path.join(__dirname, 'scheduler-frontend/public/data.json');
const OUTPUT_FILE = path.join(__dirname, 'Timetable_DSA/locked.txt');

// Helper to sanitize text (replace newlines with '|' or space for single line file format)
// We need to keep the content intact for exact matching later, but newlines in C fscanf are tricky.
// Strategy: We will Use a visible separator like "|" for the file, but keep newlines encoded as literals if needed.
// Actually, `strdup` in C needs the exact string.
// Let's replace real newlines with a placeholder string "<NL>" which C side can decode?
// OR better: The C parser uses `fscanf` which breaks on whitespace.
// We should use a delimiter that is NOT space. Let's use `|` as separator for fields,
// and for the content, we replace spaces with `_SPACE_` and newlines with `_NEWLINE_`?
// Too complex.
//
// Simpler Strategy:
// The C parser `load_locks` will read line by line using `fgets`.
// The format will be:
// Branch|Semester|Section|Day|Slot|Content String
//
// In `Content String`, we must escape the pipe `|` if it exists (unlikely in our data).
// And we must handle newlines.
// 
// Let's replace newlines in the content with `\n` literal characters for the text file,
// and the C 'load_locks' can interpret `\n` back to real newline, or we just store it as is?
// Our `json_safe` in C escapes newlines as `\n`. So `data.json` has `\n`.
// When we read `data.json` in JS, we get real newlines.
// We should write them as `\n` literals to `locked.txt` so `fgets` reads one line per lock.

function sanitizeForFile(content) {
    if (!content) return "FREE";
    // Replace real newline with literal \n
    return content.replace(/\n/g, '\\n');
}

function extractLocks() {
    if (!fs.existsSync(DATA_JSON_PATH)) {
        console.log("No existing data.json found. Starting fresh.");
        fs.writeFileSync(OUTPUT_FILE, "");
        return;
    }

    const data = JSON.parse(fs.readFileSync(DATA_JSON_PATH, 'utf8'));
    let locks = [];

    function traverse(node, ancestors = []) {
        if (node.type === 3 && node.grid) { // Section Node
            // Ancestors: [University, Branch, Semester]
            // We need Branch, Semester, Section
            // ancestors[1] is Branch (CS)
            // ancestors[2] is Semester (Semester_X)

            const branch = ancestors[1].name;
            const semester = ancestors[2].name;
            const section = node.name;

            node.grid.forEach((row, d) => {
                row.forEach((cell, s) => {
                    if (cell && cell !== "FREE" && cell !== "BREAK" && cell !== "LUNCH" && cell !== "-") {
                        const sanitizedContent = sanitizeForFile(cell);
                        // Format: Branch|Semester|Section|Day|Slot|Content
                        locks.push(`${branch}|${semester}|${section}|${d}|${s}|${sanitizedContent}`);
                    }
                });
            });
        }

        if (node.children) {
            node.children.forEach(child => traverse(child, [...ancestors, node]));
        }
    }

    traverse(data);

    const fileContent = locks.join('\n');
    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`>> [System] Extracted ${locks.length} locked slots to ${OUTPUT_FILE}`);
}

extractLocks();
