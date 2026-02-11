#include "structures.h"
#include <strings.h>

bool is_qualified(Professor *p, char *sub_code) {
  for (int i = 0; i < p->expertise_count; i++) {
    if (strcmp(p->expertise[i], sub_code) == 0)
      return true;
  }
  return false;
}

bool is_teacher_busy(TreeNode *branch, char *name, int d, int s) {
  if (!branch)
    return false;
  if (branch->type == SECTION_NODE) {
    if (branch->timetable->grid[d][s] &&
        strstr(branch->timetable->grid[d][s], name))
      return true;
  }
  for (int i = 0; i < branch->child_count; i++)
    if (is_teacher_busy(branch->children[i], name, d, s))
      return true;
  return false;
}

bool solve_branch_timetable(TreeNode *root, Queue *pipeline,
                            SolverHistory *history) {
  // Check if the pipeline is truly empty
  if (pipeline == NULL || pipeline->front == NULL)
    return true;

  QueueNode *current = pipeline->front;
  ScheduleRequest req = current->req;

  // Crucial: Find the branch node to access the Teacher Pool
  TreeNode *branch = root->children[0];
  BranchData *bd = branch->branch_info;

  // Define available slots (Skipping 2 and 5 for Breaks)
  int days[] = {0, 1, 2, 3, 4};
  int slots[] = {0, 1, 3, 4, 6, 7};

  // Shuffle only once per recursion level to maintain variety
  for (int i = 4; i > 0; i--) {
    int j = rand() % (i + 1);
    int temp = days[i];
    days[i] = days[j];
    days[j] = temp;
  }

  // Attempt to find a qualified teacher
  for (int t = 0; t < bd->teacher_count; t++) {
    Professor *p = &bd->teachers[t];

    if (is_qualified(p, req.course_code)) {
      for (int d_idx = 0; d_idx < 5; d_idx++) {
        for (int s_idx = 0; s_idx < 6; s_idx++) {
          int d = days[d_idx];
          int s = slots[s_idx];

          // DEBUG: Check slot status

          // CHECK LAB CONSTRAINT: Needs 2 consecutive slots
          bool is_lab = (strcasecmp(req.type, "Lab") == 0);

          if (is_lab) {
            // Labs cannot start at last slot of a block (1, 4, 7) because next
            // is break/end Valid starts: 0 (0-1), 3 (3-4), 6 (6-7) Invalid
            // starts: 1, 4, 7
            if (s == 1 || s == 4 || s == 7)
              continue;

            // Check if BOTH slots are free
            // Slot s and s+1
            int s_next = s + 1;

            if (req.target_section->timetable->grid[d][s] == NULL &&
                req.target_section->timetable->grid[d][s_next] == NULL &&
                !is_teacher_busy(branch, p->name, d, s) &&
                !is_teacher_busy(branch, p->name, d, s_next)) {

              char entry[100];
              sprintf(entry, "%s (%s)\n%s", req.course_code, req.type, p->name);

              // Assign BOTH slots
              req.target_section->timetable->grid[d][s] = strdup(entry);
              req.target_section->timetable->grid[d][s_next] = strdup(entry);

              pipeline->front = current->next;
              if (solve_branch_timetable(root, pipeline, history)) {
                return true;
              }

              // Backtrack BOTH
              pipeline->front = current;
              free(req.target_section->timetable->grid[d][s]);
              req.target_section->timetable->grid[d][s] = NULL;

              free(req.target_section->timetable->grid[d][s_next]);
              req.target_section->timetable->grid[d][s_next] = NULL;
            }

          } else {
            // NORMAL LECTURE (1 Hour)
            if (req.target_section->timetable->grid[d][s] == NULL &&
                !is_teacher_busy(branch, p->name, d, s)) {

              char entry[100];
              sprintf(entry, "%s (%s)\n%s", req.course_code, req.type, p->name);
              req.target_section->timetable->grid[d][s] = strdup(entry);

              // MOVE TO NEXT SUBJECT
              pipeline->front = current->next;
              if (solve_branch_timetable(root, pipeline, history)) {
                return true; // Success path
              }

              // BACKTRACK: This path failed, clean up
              pipeline->front = current;
              free(req.target_section->timetable->grid[d][s]);
              req.target_section->timetable->grid[d][s] = NULL;
            }
          }
        }
      }
    }
  }
  return false; // This triggers the "Backtrack" to the previous subject
}

void display_section_timetable(TreeNode *root, char *b_name, char *sec_name) {
  if (!root)
    return;

  // Search for the section node regardless of branch/sem depth
  if (root->type == SECTION_NODE && strcasecmp(root->name, sec_name) == 0) {
    printf("\n=========================================");
    printf("\n TIMETABLE FOR: %s", root->name);
    printf("\n=========================================\n");
    for (int d = 0; d < MAX_DAYS; d++) {
      printf("Day %d: ", d + 1);
      for (int s = 0; s < MAX_SLOTS; s++) {
        if (s == 2)
          printf("[SHORT BREAK] ");
        else if (s == 5)
          printf("[LUNCH] ");
        else
          printf("[%s] ", root->timetable->grid[d][s]
                              ? root->timetable->grid[d][s]
                              : "---");
      }
      printf("\n");
    }
    printf("=========================================\n");
    return;
  }

  for (int i = 0; i < root->child_count; i++) {
    display_section_timetable(root->children[i], b_name, sec_name);
  }
}