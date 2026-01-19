export const generateCInput = (allSemesters, branchName) => {
    let content = "";

    // 1. BRANCH NAME
    content += `${branchName}\n`;

    // 2. TEACHER EXPERTISE (Calculated automatically from assignments)
    const teacherMap = {}; 
    allSemesters.forEach(sem => {
        sem.courses.forEach(course => {
            course.teachers.forEach(tName => {
                const safeName = tName.trim().replace(/\s+/g, '_');
                if (!teacherMap[safeName]) teacherMap[safeName] = new Set();
                teacherMap[safeName].add(course.name.trim().replace(/\s+/g, '_'));
            });
        });
    });

    const teacherNames = Object.keys(teacherMap);
    content += `${teacherNames.length}\n`; // Total Teachers

    teacherNames.forEach(name => {
        const subjects = Array.from(teacherMap[name]);
        // Format: Name Count Sub1 Sub2 ...
        content += `${name} ${subjects.length} ${subjects.join(" ")}\n`;
    });

    // 3. SEMESTER CONFIGURATION (Dynamic)
    // We send the Number of Active Semesters, then the ID of each.
    content += `${allSemesters.length}\n`; 

    allSemesters.forEach(sem => {
        // Write: Semester_ID Sections_Count Subject_Count
        content += `${sem.semester} ${sem.sections} ${sem.courses.length}\n`;
        
        // Write: SubjectCode Hours
        if (sem.courses.length > 0) {
            sem.courses.forEach(c => {
                const code = c.name.trim().replace(/\s+/g, '_');
                const hours = c.hours || 4; // Default to 4 if not set
                content += `${code} ${hours}\n`;
            });
        }
    });

    return content;
};