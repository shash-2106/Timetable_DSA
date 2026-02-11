#include "structures.h"

int main(int argc, char *argv[]) {
  int role;
  TreeNode *college_root = create_tree_node("University", ROOT_COLLEGE);
  Queue *pipeline = create_queue();
  SolverHistory history = {0};

  // Check for CLI argument (config file)
  // Check for CLI argument
  if (argc > 1) {
    if (strcmp(argv[1], "validate") == 0) {
      // Usage: ./exe validate config locked branch sem sec day slot sub type
      // teacher
      if (argc < 12) {
        fprintf(stderr, "Invalid arguments for validate mode.\n");
        return 3;
      }

      load_from_file(college_root, pipeline, argv[2]);
      load_locks(college_root, argv[3]); // Load existing state

      // Parse Args
      char *branch = argv[4];
      char *sem = argv[5];
      char *sec = argv[6];
      int day = atoi(argv[7]);
      int slot = atoi(argv[8]);
      char *sub = argv[9];
      char *type = argv[10];
      char *teacher = argv[11];

      // Navigate to target section
      TreeNode *b_node = find_child_by_name(college_root, branch, BRANCH_NODE);
      TreeNode *s_node =
          b_node ? find_child_by_name(b_node, sem, SEMESTER_NODE) : NULL;
      TreeNode *sec_node =
          s_node ? find_child_by_name(s_node, sec, SECTION_NODE) : NULL;

      if (!sec_node) {
        fprintf(stderr, "Target section not found.\n");
        return 3;
      }

      int result = validate_and_assign_temporary_slot(
          college_root, sec_node, sub, type, teacher, day, slot);

      if (result == 0) {
        export_to_json(college_root, "data.json");
        printf("Success\n");
        return 0;
      } else {
        return result; // 1, 2, or 3
      }
    } else if (strcmp(argv[1], "check_slot") == 0) {
      // Same parsing as validate, but NO export
      if (argc < 12) {
        fprintf(stderr, "Invalid arguments for check_slot.\n");
        return 3;
      }

      load_from_file(college_root, pipeline, argv[2]);
      load_locks(college_root, argv[3]);

      char *branch = argv[4];
      char *sem = argv[5];
      char *sec = argv[6];
      int day = atoi(argv[7]);
      int slot = atoi(argv[8]);
      char *sub = argv[9];
      char *type = argv[10];
      char *teacher = argv[11];

      TreeNode *b_node = find_child_by_name(college_root, branch, BRANCH_NODE);
      TreeNode *s_node =
          b_node ? find_child_by_name(b_node, sem, SEMESTER_NODE) : NULL;
      TreeNode *sec_node =
          s_node ? find_child_by_name(s_node, sec, SECTION_NODE) : NULL;

      if (!sec_node) {
        fprintf(stderr, "Target section not found.\n");
        return 3;
      }

      // Perform Validation (this updates memory, but we won't save it)
      int result = validate_and_assign_temporary_slot(
          college_root, sec_node, sub, type, teacher, day, slot);

      if (result == 0) {
        printf("Valid\n"); // Just print Valid, don't export
        return 0;
      } else {
        return result;
      }
    } else if (strcmp(argv[1], "check_availability") == 0) {
      if (argc < 7) {
        fprintf(stderr, "Invalid arguments for check_availability.\n");
        return 3;
      }

      load_from_file(college_root, pipeline, argv[2]);
      load_locks(college_root, argv[3]);

      char *teacher = argv[4];
      int day = atoi(argv[5]);
      int slot = atoi(argv[6]);

      // Directly check global availability
      if (is_teacher_busy(college_root, teacher, day, slot)) {
        return 2; // Busy
      } else {
        return 0; // Free
      }
    }

    printf(">> [System] CLI Mode Enabled. Loading config: %s\n", argv[1]);
    fflush(stdout);
    load_from_file(college_root, pipeline, argv[1]);
    printf(">> [System] load_from_file DONE\n");
    fflush(stdout);

    // Validate Section Count
    int total_sections = 0;
    // Helper lambda-like block? No, usage of stack function.
    // We can't define function here. We need simple traversal or separate
    // function. Let's just traverse purely for validation. Actually, we can use
    // a small helper function defined above main. But I can't add function
    // definition easily with replace_file_content unless I replace main.c
    // start. I'll implementation inline validation or use existing header
    // helpers? No existing helper counts sections. I'll insert logic to
    // traverse college_root->branches->semesters->sections.

    // Simple verification
    if (college_root && college_root->child_count > 0) {
      for (int b = 0; b < college_root->child_count; b++) {
        TreeNode *br = college_root->children[b];
        for (int sm = 0; sm < br->child_count; sm++) {
          TreeNode *sem = br->children[sm];
          total_sections += sem->child_count;
          for (int sc = 0; sc < sem->child_count; sc++) {
            TreeNode *sec = sem->children[sc];
            if (!sec->timetable) {
              printf(">> [System] CRITICAL: Section %s has NULL timetable!\n",
                     sec->name);
              return 1;
            }
          }
        }
      }
    }
    printf(">> [System] Validated state: %d sections in memory.\n",
           total_sections);
    fflush(stdout);

    // NEW: Load existing locks and remove satisfied requests
    load_locks(college_root, "locked.txt");
    printf(">> [System] load_locks DONE\n");
    fflush(stdout);

    prune_pipeline(college_root, pipeline);
    printf(">> [System] prune_pipeline DONE. Starting solver...\n");
    fflush(stdout);

    if (solve_branch_timetable(college_root, pipeline, &history)) {
      printf("\n>> [Solver] Successfully generated all timetables.\n");
      export_to_json(college_root, "data.json");
      return 0;
    } else {
      fprintf(stderr,
              ">> [Solver] Failed: Slots full or constraints violated.\n");
      return 1;
    }
  }

  while (1) {
    printf("\n=== TIMETABLE SYSTEM ===");
    printf("\n1. ADMIN (Setup & Generate)");
    printf("\n2. TEACHER (View Schedule)");
    printf("\n3. STUDENT (View Timetable)");
    printf("\n4. EXIT");
    printf("\nSelect Role: ");

    if (scanf("%d", &role) != 1) {
      while (getchar() != '\n')
        ;
      continue;
    }

    switch (role) {
    case 1:
      admin_wizard(college_root, pipeline);

      if (solve_branch_timetable(college_root, pipeline, &history))
        printf("\n>> [Solver] Successfully generated all timetables.\n");
      export_to_json(college_root, "data.json");
      printf("DEBUG: After setup, root has %d children.\n",
             college_root->child_count);
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
      display_section_timetable(college_root, b_name, s_name);
      break;
    }

    case 4:
      exit(0);
    }
  }
  return 0;
}