const fs = require('fs');

// Path to your generated data.json
const filePath = '/Users/shashwatirao/Desktop/DSATimetable_C/scheduler-frontend/public/data.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const scheduleMap = {};   // Key: "Day-Slot-Teacher", Value: "Section" (For Constraint: No teacher in 2 places)
const occupancyMap = {};  // Key: "Section-Day-Slot", Value: "Cell Content" (For Constraint: No 2 teachers in 1 slot)
const conflicts = [];

function traverse(node, context = "") {
    // node.type === 3 identifies Section Nodes in your tree
    if (node.type === 3 && node.grid) {
        const sectionName = `${context} - ${node.name}`;

        node.grid.forEach((row, dayIndex) => {
            row.forEach((cellObj, slotIndex) => {
                let cell = (typeof cellObj === 'object' && cellObj !== null) ? cellObj.content : cellObj;
                // Ignore standard non-class markers
                if (cell && !["FREE", "BREAK", "LUNCH", "-"].includes(cell)) {

                    const sectionSlotKey = `${sectionName}-${dayIndex}-${slotIndex}`;

                    // --- CHECK CONSTRAINT 1: No 2 Teachers in the same Section/Slot ---
                    if (occupancyMap[sectionSlotKey]) {
                        conflicts.push(`❌ SECTION OVERLAP: '${sectionName}' already has '${occupancyMap[sectionSlotKey]}' but solver tried to add '${cell}' at Day ${dayIndex} Slot ${slotIndex}`);
                    } else {
                        occupancyMap[sectionSlotKey] = cell;
                    }

                    // --- EXTRACT TEACHER(S) ---
                    let teachers = [];
                    // Handles your NEW FORMAT: Subject (Type)\nTeacher
                    if (cell.includes('\n')) {
                        const parts = cell.split('\n');
                        teachers.push(parts[parts.length - 1].trim());
                    } else {
                        // Handles your OLD FORMAT: Subject (Teacher)
                        const match = cell.match(/\(([^)]+)\)$/);
                        if (match) teachers.push(match[1]);
                    }

                    // --- CHECK CONSTRAINT 2: No Teacher in 2 Sections simultaneously ---
                    teachers.forEach(teacher => {
                        const teacherTimeKey = `${dayIndex}-${slotIndex}-${teacher}`;

                        if (scheduleMap[teacherTimeKey]) {
                            conflicts.push(`❌ TEACHER CONFLICT: '${teacher}' is assigned to '${cell.replace(/\n/g, ' ')}' in [${sectionName}] AND [${scheduleMap[teacherTimeKey]}] at Day ${dayIndex} Slot ${slotIndex}`);
                        } else {
                            scheduleMap[teacherTimeKey] = sectionName;
                        }
                    });
                }
            });
        });
    }

    if (node.children) {
        node.children.forEach(child => {
            // Build the context string for the hierarchy
            const nextContext = node.name === "University" ? "" : (context ? `${context} - ${node.name}` : node.name);
            traverse(child, nextContext);
        });
    }
}

console.log("🔍 Starting Audit of Master Schedule...");
traverse(data);

if (conflicts.length > 0) {
    console.log(`\nFound ${conflicts.length} total conflicts:`);
    conflicts.forEach(c => console.log(c));
} else {
    console.log("\n✅ ALL CONSTRAINTS MET.");
    console.log(`- Verified ${Object.keys(occupancyMap).length} total allocated slots.`);
    console.log(`- Verified ${Object.keys(scheduleMap).length} individual teacher assignments.`);
}