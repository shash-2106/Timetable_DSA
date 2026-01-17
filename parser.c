#include "structures.h"

TreeNode* add_branch_to_college(TreeNode* root, const char* name) {
    TreeNode* b = create_tree_node(name, BRANCH_NODE);
    add_child(root, b);
    return b;
}

TreeNode* add_semester_to_branch(TreeNode* b, const char* name) {
    TreeNode* s = create_tree_node(name, SEMESTER_NODE);
    add_child(b, s);
    return s;
}

TreeNode* add_section_to_semester(TreeNode* s, const char* name) {
    TreeNode* sec = create_tree_node(name, SECTION_NODE);
    add_child(s, sec);
    return sec;
}

// FIXED: Removed 'int load' to match structures.h
void add_teacher_to_branch(TreeNode* b, char* name) {
    if (!b || !b->branch_info) return;
    BranchData* bd = b->branch_info;
    if (bd->teacher_count < 50) {
        strncpy(bd->teachers[bd->teacher_count].name, name, 49);
        bd->teacher_count++;
    }
}

bool validate_teacher(TreeNode* b, char* name) {
    if (!b || !b->branch_info) return false;
    for (int i = 0; i < b->branch_info->teacher_count; i++) {
        if (strcmp(b->branch_info->teachers[i].name, name) == 0) return true;
    }
    return false;
}

void admin_wizard(TreeNode* root, Queue* pipeline) {
    char name[50];
    int t_count, s_count, sub_count, exp_count;

    printf("\n--- STEP 1: BRANCH ---\n");
    printf("Enter Branch Name: "); scanf("%s", name);
    TreeNode* b = add_branch_to_college(root, name);

    printf("\n--- STEP 2: TEACHER EXPERTISE ---\n");
    printf("How many teachers? "); scanf("%d", &t_count);
    for (int i = 0; i < t_count; i++) {
        printf("  Teacher %d Name: ", i + 1); scanf("%s", name);
        add_teacher_to_branch(b, name); 
        
        // Get pointer to the teacher we just added to fill expertise
        Professor* p = &b->branch_info->teachers[b->branch_info->teacher_count - 1];
        
        printf("  How many subjects can %s teach? ", name); scanf("%d", &exp_count);
        p->expertise_count = exp_count;
        for (int j = 0; j < exp_count; j++) {
            printf("    Enter Expertise Subject Code %d: ", j + 1);
            scanf("%s", p->expertise[j]);
        }
    }

    for (int s = 1; s <= 3; s++) {
        printf("\n--- SEMESTER %d SETUP ---\n", s);
        char sem_label[20]; sprintf(sem_label, "Semester_%d", s);
        TreeNode* sem_node = add_semester_to_branch(b, sem_label);

        printf("  Number of Sections: "); scanf("%d", &s_count);
        TreeNode* sections[MAX_CHILDREN];
        for (int i = 0; i < s_count; i++) {
            sprintf(name, "Sec_%c", 'A' + i);
            sections[i] = add_section_to_semester(sem_node, name);
        }

        printf("  Number of Subjects for this Sem: "); scanf("%d", &sub_count);
        for (int j = 0; j < sub_count; j++) {
            char sub_code[10];
            printf("    Subject %d Code: ", j + 1); scanf("%s", sub_code);
            
            for (int i = 0; i < s_count; i++) {
                ScheduleRequest req;
                strcpy(req.course_code, sub_code);
                req.target_section = sections[i];
                enqueue(pipeline, req);
            }
        }
    }
}