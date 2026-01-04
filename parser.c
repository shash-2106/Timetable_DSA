#include "structures.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void load_department_data(const char* filename, CourseNode** inventory, TreeNode** root_ptr) {
    FILE* file = fopen(filename, "r");
    if (!file) {
        printf("ERROR: Could not open file %s\n", filename);
        return;
    }

    int num_depts;
    char buf[100];

    // 1. Read Number of Departments and the Department Name (e.g., CS_Dept)
    if (fscanf(file, "%d %s", &num_depts, buf) != 2) {
        fclose(file);
        return;
    }

    // 2. Create the Root Node (The Department)
    TreeNode* local_root = create_tree_node(buf, false);
    if (!local_root) {
        fclose(file);
        return;
    }

    // 3. Create exactly 5 Section Nodes as children of the Root
    // These are the only nodes that will have a 'timetable' grid
    char* names[] = {"Section_A", "Section_B", "Section_C", "Section_D", "Section_E"};
    for (int i = 0; i < 5; i++) {
        TreeNode* sec_node = create_tree_node(names[i], true);
        if (local_root->child_count < 10) {
            local_root->children[local_root->child_count++] = sec_node;
        }
    }

    // 4. Consume/Skip the placeholder structural lines in your text file
    // These lines: "1 1 2", "1 2 1", "1 CS_Building", "DSA_Batch"
    int d;
    fscanf(file, "%d %d %d", &d, &d, &d); 
    fscanf(file, "%d %d %d", &d, &d, &d);
    fscanf(file, "%d %s %s", &d, buf, buf);

    // 5. Load the 4 Categories (CORE, LABS, MATHS, DTL)
    // We only put the subjects into the Inventory (Linked List)
    for (int i = 0; i < 4; i++) {
        char cat_name[50];
        int num_courses;
        if (fscanf(file, "%s %d", cat_name, &num_courses) != 2) break;

        for (int j = 0; j < num_courses; j++) {
            int tut, lab, lec;
            char prof[50];
            if (fscanf(file, "%d %d %d %s", &tut, &lab, &lec, prof) != 4) break;

            Course c;
            c.needs_lab = (lab > 0);
            c.lectures_per_week = lec;
            strncpy(c.prof.name, prof, 49);
            
            // Name subjects SUB1, SUB2... and labs LAB1, LAB2...
            if (c.needs_lab) {
                sprintf(c.code, "LAB%d", j + 1);
            } else {
                sprintf(c.code, "SUB%d", j + 1);
            }

            append_course(inventory, c);
        }
    }

    fclose(file);
    *root_ptr = local_root; // Set the global root pointer
    printf("DEBUG: Tree linked. Root: %s, Children: %d (Sections Created)\n", 
            local_root->name, local_root->child_count);
}