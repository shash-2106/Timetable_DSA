#include "structures.h"

int main() {
    int role;
    TreeNode* college_root = create_tree_node("University", ROOT_COLLEGE);
    Queue* pipeline = create_queue();
    SolverHistory history = {0};

    while (1) {
        printf("\n=== TIMETABLE SYSTEM ===");
        printf("\n1. ADMIN (Setup & Generate)");
        printf("\n2. TEACHER (View Schedule)");
        printf("\n3. STUDENT (View Timetable)");
        printf("\n4. EXIT");
        printf("\nSelect Role: ");
        
        if (scanf("%d", &role) != 1) { while(getchar() != '\n'); continue; }

        switch (role) {
            case 1:
                admin_wizard(college_root, pipeline);
                
                if (solve_branch_timetable(college_root, pipeline, &history))
                    printf("\n>> [Solver] Successfully generated all timetables.\n");
                export_to_json(college_root, "data.json");
                printf("DEBUG: After setup, root has %d children.\n", college_root->child_count);
                break;

                case 2: {
                    char t_name[50];
                    printf("\nWho are we looking for? ");
                    fflush(stdout); 
                    scanf("%s", t_name); 
                    
                    printf("\n--- STARTING DEEP SCAN FOR: %s ---\n", t_name);
                    get_teacher_view(college_root, t_name, "Root");
                    printf("--- SCAN FINISHED ---\n\n");
                    break;
                }

            case 3: {
                char b_name[50], s_name[10];
                printf("Enter Branch Name (Exact, e.g., CSE): "); 
                scanf("%s", b_name);
                printf("Enter Section Name (Exact, e.g., Sec_A): "); 
                scanf("%s", s_name);
                
                // This starts the search from the very top of the tree
                display_section_timetable(college_root, b_name, s_name);                break;
            }

            case 4: exit(0);
        }
    }
    return 0;
}