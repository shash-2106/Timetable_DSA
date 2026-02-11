#include "structures.h"
#include <strings.h>
#include <time.h>

bool is_qualified(Professor *p, char *sub_code) {
  for (int i = 0; i < p->expertise_count; i++) {
    if (i >= 30)
      break; // Safety
    if (strcmp(p->expertise[i], sub_code) == 0)
      return true;
  }
  return false;
}

bool is_teacher_busy(TreeNode *branch, char *name, int d, int s) {
  if (!branch)
    return false;

  if (branch->type == SECTION_NODE) {
    if (!branch->timetable) {
      return false; // Safety
    }
    char *cell = branch->timetable->grid[d][s];
    if (cell && strstr(cell, name))
      return true;
  }
  for (int i = 0; i < branch->child_count; i++) {
    if (i >= 20)
      break; // Safety
    if (is_teacher_busy(branch->children[i], name, d, s))
      return true;
  }
  return false;
}

/*
 * ITERATIVE GREEDY SOLVER with Placement Undo Stack
 *
 * DSA used:
 *   - Queue (linked list):  scheduling requests are consumed from the pipeline
 *   - Tree traversal:       is_teacher_busy walks the college tree
 *   - Stack (undo_stack):   heap-allocated LIFO stack tracks every slot
 *                           the solver fills, so a failed attempt can be
 *                           rolled back in O(n) without recursion
 *
 * Algorithm:
 *   1. Drain the Queue into an array for random-access shuffling.
 *   2. For each attempt (up to MAX_ATTEMPTS):
 *      a. Fisher–Yates shuffle the request array for variety.
 *      b. Greedily place each request (first valid teacher × day × slot).
 *      c. If every request is placed → success.
 *      d. Otherwise, pop the undo stack (LIFO) to clear all placements
 *         made during this attempt and try again.
 *   3. Return false if all attempts exhausted.
 */

/* Single placement record pushed onto the undo stack */
typedef struct {
  TreeNode *section;
  int day;
  int slot;
} Placement;

bool solve_branch_timetable(TreeNode *root, Queue *pipeline,
                            SolverHistory *history) {
  /* Nothing to schedule */
  if (!pipeline || !pipeline->front)
    return true;

  /* Navigate to the branch node (Tree traversal) */
  if (root->child_count == 0 || root->children[0] == NULL)
    return false;
  TreeNode *branch = root->children[0];
  if (!branch->branch_info)
    return false;
  BranchData *bd = branch->branch_info;

  /* ── 1. Drain the Queue into an array ── */
  int total = 0;
  for (QueueNode *qn = pipeline->front; qn; qn = qn->next)
    total++;
  if (total == 0)
    return true;

  ScheduleRequest *reqs =
      (ScheduleRequest *)malloc(total * sizeof(ScheduleRequest));
  if (!reqs) {
    printf(">> [Solver] CRITICAL: Failed to allocate requests array\n");
    return false;
  }
  printf(">> [Solver] Allocated requests array at %p\n", (void *)reqs);
  fflush(stdout);

  QueueNode *qn = pipeline->front;
  for (int i = 0; i < total; i++) {
    reqs[i] = qn->req;
    qn = qn->next;
  }

  printf(">> [Solver] %d requests to place. Iterative greedy solver.\n", total);
  fflush(stdout);

  /* ── 2. Allocate the Undo Stack (heap) ── */
  int max_placements = total * 2; /* labs occupy 2 slots each */
  Placement *undo_stack =
      (Placement *)malloc(max_placements * sizeof(Placement));
  if (!undo_stack) {
    printf(">> [Solver] CRITICAL: Failed to allocate undo stack\n");
    free(reqs);
    return false;
  }
  printf(">> [Solver] Allocated undo stack at %p (size %d)\n",
         (void *)undo_stack, max_placements);
  fflush(stdout);

  /* Usable slot indices (breaks at 2 and 5 are skipped) */
  int avail_slots[] = {0, 1, 3, 4, 6, 7};

  srand((unsigned)time(NULL));

#define MAX_ATTEMPTS 30
  bool success = false;

  for (int attempt = 0; attempt < MAX_ATTEMPTS && !success; attempt++) {
    printf(">> [Solver] Starting attempt %d/%d...\n", attempt + 1,
           MAX_ATTEMPTS);
    fflush(stdout);

    int undo_top = 0; /* stack pointer */
    bool failed = false;

    /* ── 2a. Fisher–Yates shuffle the requests ── */
    printf(">> [Solver] Shuffling %d requests...\n", total);
    fflush(stdout);
    for (int i = total - 1; i > 0; i--) {
      int j = rand() % (i + 1);
      // Detailed check for first shuffle
      if (attempt == 0 && i == total - 1) {
        printf(">> [Solver] First shuffle swap: i=%d j=%d\n", i, j);
        fflush(stdout);
      }
      ScheduleRequest tmp = reqs[i];
      reqs[i] = reqs[j];
      reqs[j] = tmp;
    }
    printf(">> [Solver] Shuffle done.\n");
    fflush(stdout);

    /* ── 2b. Greedy placement pass ── */
    printf(">> [Solver] pass start. Teacher count: %d\n", bd->teacher_count);
    fflush(stdout);

    for (int r = 0; r < total && !failed; r++) {
      ScheduleRequest req = reqs[r];
      bool placed = false;
      bool is_lab = (strcasecmp(req.type, "Lab") == 0);

      printf(">> [Solver]   Processing Req %d/%d: %s (%s)\n", r + 1, total,
             req.course_code, req.type);
      fflush(stdout);

      /* Shuffle days per request for variety */
      int days[] = {0, 1, 2, 3, 4};
      for (int i = 4; i > 0; i--) {
        int j = rand() % (i + 1);
        int t = days[i];
        days[i] = days[j];
        days[j] = t;
      }

      /* Try every qualified teacher × shuffled day × slot */
      for (int t = 0; t < bd->teacher_count && !placed; t++) {
        Professor *p = &bd->teachers[t];
        if (!is_qualified(p, req.course_code))
          continue;

        for (int di = 0; di < 5 && !placed; di++) {
          for (int si = 0; si < 6 && !placed; si++) {
            int d = days[di];
            int s = avail_slots[si];
            // Safety check for grid
            if (!req.target_section || !req.target_section->timetable) {
              printf(">> [Solver] CRITICAL: Invalid section or timetable for "
                     "req %s\n",
                     req.course_code);
              fflush(stdout);
              failed = true;
              break;
            }

            if (is_lab) {
              /* Labs need 2 consecutive slots; skip invalid start positions */
              if (s == 1 || s == 4 || s == 7)
                continue;
              int sn = s + 1;

              if (req.target_section->timetable->grid[d][s] == NULL &&
                  req.target_section->timetable->grid[d][sn] == NULL &&
                  !is_teacher_busy(branch, p->name, d, s) &&
                  !is_teacher_busy(branch, p->name, d, sn)) {

                char entry[100];
                sprintf(entry, "%s (%s)\n%s", req.course_code, req.type,
                        p->name);

                req.target_section->timetable->grid[d][s] = strdup(entry);
                req.target_section->timetable->grid[d][sn] = strdup(entry);

                /* Push BOTH slots onto undo stack (LIFO) */
                undo_stack[undo_top++] = (Placement){req.target_section, d, s};
                undo_stack[undo_top++] = (Placement){req.target_section, d, sn};
                placed = true;
              }
            } else {
              /* Normal 1-hour lecture */
              if (req.target_section->timetable->grid[d][s] == NULL &&
                  !is_teacher_busy(branch, p->name, d, s)) {

                char entry[100];
                sprintf(entry, "%s (%s)\n%s", req.course_code, req.type,
                        p->name);
                req.target_section->timetable->grid[d][s] = strdup(entry);

                /* Push onto undo stack */
                undo_stack[undo_top++] = (Placement){req.target_section, d, s};
                placed = true;
              }
            }
          }
        }
      }

      if (!placed)
        failed = true;
    }

    /* ── 2c / 2d. Check result ── */
    if (!failed) {
      success = true;
      history->subjects_placed = total;
      printf(">> [Solver] Success on attempt %d/%d!\n", attempt + 1,
             MAX_ATTEMPTS);
      fflush(stdout);
    } else {
      /* Pop the entire undo stack (LIFO rollback) */
      for (int i = undo_top - 1; i >= 0; i--) {
        Placement pl = undo_stack[i];
        free(pl.section->timetable->grid[pl.day][pl.slot]);
        pl.section->timetable->grid[pl.day][pl.slot] = NULL;
      }
    }
  }

  free(undo_stack);
  free(reqs);

  if (!success) {
    printf(">> [Solver] Failed after %d attempts.\n", MAX_ATTEMPTS);
    fflush(stdout);
  }

  return success;
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

// Returns:
// 0: Success
// 1: Slot Not Free
// 2: Teacher Busy
// 3: Invalid Slot (Break) or Out of Bounds
// Returns:
// 0: Success
// 1: Slot Not Free
// 2: Teacher Busy
// 3: Invalid Slot (Break) or Out of Bounds
int validate_and_assign_temporary_slot(TreeNode *college_root,
                                       TreeNode *target_section,
                                       char *course_code, char *type,
                                       char *teacher_name, int day, int slot) {
  int slots_needed = (strcmp(type, "Lab") == 0) ? 2 : 1;

  // 0. Check Bounds and Breaks
  for (int k = 0; k < slots_needed; k++) {
    int s = slot + k;
    if (day < 0 || day >= MAX_DAYS || s < 0 || s >= MAX_SLOTS)
      return 3;
    if (s == 2 || s == 5)
      return 3; // Break Slots
  }

  // 1. Check if Slot(s) are Free
  for (int k = 0; k < slots_needed; k++) {
    int s = slot + k;
    if (target_section->timetable->grid[day][s] != NULL)
      return 1;
  }

  // 2. Check if Teacher is Busy (Global Tree Traversal)
  for (int k = 0; k < slots_needed; k++) {
    int s = slot + k;
    if (is_teacher_busy(college_root, teacher_name, day, s))
      return 2;
  }

  // 3. Assign
  for (int k = 0; k < slots_needed; k++) {
    int s = slot + k;
    char entry[100];
    sprintf(entry, "%s (%s)\n%s", course_code, type, teacher_name);
    target_section->timetable->grid[day][s] = strdup(entry);
    target_section->timetable->is_fixed[day][s] = true; // Mark as locked
  }

  return 0;
}