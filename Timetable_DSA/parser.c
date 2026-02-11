#include "structures.h"

// Helper to find existing child node
TreeNode *find_child_by_name(TreeNode *parent, const char *name,
                             NodeType type) {
  if (!parent)
    return NULL;
  for (int i = 0; i < parent->child_count; i++) {
    if (parent->children[i]->type == type &&
        strcmp(parent->children[i]->name, name) == 0) {
      return parent->children[i];
    }
  }
  return NULL;
}

TreeNode *add_branch_to_college(TreeNode *root, const char *name) {
  TreeNode *existing = find_child_by_name(root, name, BRANCH_NODE);
  if (existing)
    return existing;

  TreeNode *b = create_tree_node(name, BRANCH_NODE);
  add_child(root, b);
  return b;
}

TreeNode *add_semester_to_branch(TreeNode *b, const char *name) {
  TreeNode *existing = find_child_by_name(b, name, SEMESTER_NODE);
  if (existing)
    return existing;

  TreeNode *s = create_tree_node(name, SEMESTER_NODE);
  add_child(b, s);
  return s;
}

TreeNode *add_section_to_semester(TreeNode *s, const char *name) {
  TreeNode *existing = find_child_by_name(s, name, SECTION_NODE);
  if (existing)
    return existing;

  TreeNode *sec = create_tree_node(name, SECTION_NODE);
  add_child(s, sec);
  return sec;
}

// FIXED: Removed 'int load' to match structures.h
void add_teacher_to_branch(TreeNode *b, char *name) {
  if (!b || !b->branch_info)
    return;
  BranchData *bd = b->branch_info;
  if (bd->teacher_count < 50) {
    strncpy(bd->teachers[bd->teacher_count].name, name, 49);
    bd->teacher_count++;
  }
}

bool validate_teacher(TreeNode *b, char *name) {
  if (!b || !b->branch_info)
    return false;
  for (int i = 0; i < b->branch_info->teacher_count; i++) {
    if (strcmp(b->branch_info->teachers[i].name, name) == 0)
      return true;
  }
  return false;
}

void admin_wizard(TreeNode *root, Queue *pipeline) {
  char name[50];
  int t_count, s_count, sub_count, exp_count;

  printf("\n--- STEP 1: BRANCH ---\n");
  printf("Enter Branch Name: ");
  scanf("%s", name);
  TreeNode *b = add_branch_to_college(root, name);

  printf("\n--- STEP 2: TEACHER EXPERTISE ---\n");
  printf("How many teachers? ");
  scanf("%d", &t_count);
  for (int i = 0; i < t_count; i++) {
    printf("  Teacher %d Name: ", i + 1);
    scanf("%s", name);
    add_teacher_to_branch(b, name);

    // Get pointer to the teacher we just added to fill expertise
    Professor *p = &b->branch_info->teachers[b->branch_info->teacher_count - 1];

    printf("  How many subjects can %s teach? ", name);
    scanf("%d", &exp_count);
    p->expertise_count = exp_count;
    for (int j = 0; j < exp_count; j++) {
      printf("    Enter Expertise Subject Code %d: ", j + 1);
      scanf("%s", p->expertise[j]);
    }
  }

  for (int s = 1; s <= 3; s++) {
    printf("\n--- SEMESTER %d SETUP ---\n", s);
    char sem_label[20];
    sprintf(sem_label, "Semester_%d", s);
    TreeNode *sem_node = add_semester_to_branch(b, sem_label);

    printf("  Number of Sections: ");
    scanf("%d", &s_count);
    TreeNode *sections[MAX_CHILDREN];
    for (int i = 0; i < s_count; i++) {
      sprintf(name, "Sec_%c", 'A' + i);
      sections[i] = add_section_to_semester(sem_node, name);
    }

    printf("  Number of Subjects for this Sem: ");
    scanf("%d", &sub_count);
    for (int j = 0; j < sub_count; j++) {
      char sub_code[10];
      printf("    Subject %d Code: ", j + 1);
      scanf("%s", sub_code);

      for (int i = 0; i < s_count; i++) {
        ScheduleRequest req;
        strcpy(req.course_code, sub_code);
        req.target_section = sections[i];
        enqueue(pipeline, req);
      }
    }
  }
}

void load_from_file(TreeNode *root, Queue *pipeline, const char *filename) {
  FILE *f = fopen(filename, "r");
  if (!f) {
    printf("Error: Could not open config file %s\n", filename);
    exit(1);
  }

  char name[100];
  int t_count, exp_count;

  // 1. Branch Name
  if (fscanf(f, "%99s", name) != 1)
    return;
  TreeNode *b = add_branch_to_college(root, name);
  printf(">> [Loader] Branch: %s\n", name);
  fflush(stdout);

  // 2. Teachers
  if (fscanf(f, "%d", &t_count) != 1)
    return;
  printf(">> [Loader] Reading %d teachers...\n", t_count);
  fflush(stdout);

  for (int i = 0; i < t_count; i++) {
    fscanf(f, "%99s", name);
    add_teacher_to_branch(b, name);

    // Safety check: ensure we actually added a teacher
    if (b->branch_info->teacher_count == 0)
      continue;

    Professor *p = &b->branch_info->teachers[b->branch_info->teacher_count - 1];

    fscanf(f, "%d", &exp_count);
    p->expertise_count = exp_count;
    for (int j = 0; j < exp_count; j++) {
      fscanf(f, "%9s", p->expertise[j]);
    }
  }

  // 3. Semesters
  int sem_count_total;
  if (fscanf(f, "%d", &sem_count_total) != 1)
    return;
  printf(">> [Loader] Reading %d semesters...\n", sem_count_total);

  for (int k = 0; k < sem_count_total; k++) {
    int sem_id, num_sections, num_courses;
    // Format: Semester_ID Sections_Count Subject_Count
    fscanf(f, "%d %d %d", &sem_id, &num_sections, &num_courses);

    char sem_label[20];
    sprintf(sem_label, "Semester_%d", sem_id);
    TreeNode *sem_node = add_semester_to_branch(b, sem_label);

    TreeNode *sections[MAX_CHILDREN];
    for (int i = 0; i < num_sections; i++) {
      sprintf(name, "Sec_%c", 'A' + i);
      sections[i] = add_section_to_semester(sem_node, name);
    }

    // Subjects
    for (int j = 0; j < num_courses; j++) {
      char sub_code[50];
      char sub_type[15];
      int hours;
      // Format: SubjectCode Hours Type
      fscanf(f, "%49s %d %14s", sub_code, &hours, sub_type);

      for (int i = 0; i < num_sections; i++) {
        // FIX: Enqueue multiple requests based on 'hours'
        for (int h = 0; h < hours; h++) {
          ScheduleRequest req;
          strcpy(req.course_code, sub_code);
          strcpy(req.type, sub_type);
          req.target_section = sections[i];
          enqueue(pipeline, req);
        }
      }
    }
  }

  fclose(f);
  printf(">> [Loader] Configuration loaded successfully from %s.\n", filename);
}

void load_locks(TreeNode *root, const char *filename) {
  FILE *f = fopen(filename, "r");
  if (!f) {
    printf(">> [Locks] No existing locks found (File not found: %s).\n",
           filename);
    return;
  }

  printf("\n>> [Locks] Loading persistent schedule...\n");
  char line[256];
  int count = 0;

  while (fgets(line, sizeof(line), f)) {
    // Format: Branch|Semester|Section|Day|Slot|Content
    char *branch = strtok(line, "|");
    char *sem = strtok(NULL, "|");
    char *sec = strtok(NULL, "|");
    char *s_day = strtok(NULL, "|");
    char *s_slot = strtok(NULL, "|");
    char *content = strtok(NULL, "\n"); // Read until newline

    if (branch && sem && sec && s_day && s_slot && content) {
      // Navigate Tree
      TreeNode *b_node = find_child_by_name(root, branch, BRANCH_NODE);
      if (!b_node)
        continue;

      TreeNode *sem_node = find_child_by_name(b_node, sem, SEMESTER_NODE);
      if (!sem_node)
        continue;

      TreeNode *sec_node = find_child_by_name(sem_node, sec, SECTION_NODE);
      if (!sec_node || !sec_node->timetable)
        continue;

      int d = atoi(s_day);
      int s = atoi(s_slot);

      // Unescape \n back to newline if needed, but our json_safe handles it.
      // Actually, we stored it as "\n" literal in file.
      // Simplification: We blindly strdup.
      // If content has "\n" literal, we might want to replace it with real
      // newline for consistency?

      // Reconstruct content with real newline if needed
      // For now, let's assume content is clean or acceptable.
      // NOTE: 'extract_locks.js' escaped newlines as '\\n'. C needs to
      // unescape? Or we just store it. If we store '\\n', then display might
      // show '\n'. Let's do a simple unescape:
      char final_content[200];
      int k = 0;
      for (int i = 0; content[i] != '\0'; i++) {
        if (content[i] == '\\' && content[i + 1] == 'n') {
          final_content[k++] = '\n';
          i++;
        } else {
          final_content[k++] = content[i];
        }
      }
      final_content[k] = '\0';

      sec_node->timetable->grid[d][s] = strdup(final_content);
      count++;
    }
  }
  fclose(f);
  printf(">> [Locks] Restored %d slots.\n", count);
}

void prune_pipeline(TreeNode *root, Queue *pipeline) {
  if (!pipeline || !pipeline->front)
    return;

  printf(">> [Pruner] Optimizing request pipeline...\n");
  int initial_count = 0;
  int removed_count = 0;

  // We need to count required vs scheduled for each (Section, Subject) pair.
  // Since traversing the whole queue is O(N), and checking grid is O(1),
  // efficient enough.

  // We can't easily delete from middle of queue with single linked list without
  // prev pointer. Strategy: Create a NEW queue, enqueue only needed items.
  // Replace old queue.

  QueueNode *current = pipeline->front;
  QueueNode *new_front = NULL;
  QueueNode *new_rear = NULL;

  while (current != NULL) {
    initial_count++;
    ScheduleRequest req = current->req;

    // Count how many times this subject is ALREADY in the grid
    int scheduled_instances = 0;

    // Scan the grid of the target section
    for (int d = 0; d < MAX_DAYS; d++) {
      for (int s = 0; s < MAX_SLOTS; s++) {
        char *cell = req.target_section->timetable->grid[d][s];
        if (cell && strstr(cell, req.course_code)) {
          scheduled_instances++;
        }
      }
    }

    // We encounter requests 1 by 1.
    // Logic:
    // We know total requests for a subject = Total Hours (e.g. 4) due to our
    // new loop. We see 4 requests in queue. If grid already has 2 instances. We
    // should KEEP 2 requests, and DROP 2. PROBLEM: 'scheduled_instances' is
    // constant (2). If we iterate, we will drop ALL 4 if we say "if scheduled >
    // 0". WE NEED STATE.

    // Complex Implementation for stateless prune:
    // We can't do it easily without a hashmap of (Section+Subject ->
    // CountProcessed).
    //
    // SIMPLER APPROACH:
    // Build a Temporary "Pending Counts" Map? Too hard in C.
    //
    // ALTERNATIVE:
    // Modify 'load_from_file' to NOT enqueue if already full?
    // But 'load_from_file' runs BEFORE 'load_locks'.
    //
    // WORKING APPROACH:
    // 1. Traverse Queue. Use a static small buffer/array to track "Seen
    // Requests" for this subject? No.
    // 2. Iterate queue. For each req, check "How many MORE do we need?"
    //    Total Needed = (Total Hours from Config) -> We don't have this easily
    //    unless we re-parse.
    //
    // Let's use a trick:
    // The Queue contains ALL requirements (e.g. 4 nodes for Math).
    // The Grid contains LOCKS (e.g. 2 slots for Math).
    // We want to filter the Queue to have only (4-2) = 2 nodes.
    //
    // We can decrement a "Quota" for the locks.
    // Actually, we can just counts locks. Say L=2.
    // When processing queue for Math:
    //   First node: if L > 0, decrement L, SKIP node.
    //   Second node: if L > 0, decrement L, SKIP node.
    //   Third node: L=0, KEEP node.
    //
    // But we need to store 'L' somewhere flexible.
    // Hack: Store 'L' in the Section Node temporarily? No.
    //
    // Brute Force for this scale:
    // For every request in queue, scan the queue AHEAD to see index? No.
    //
    // OK, let's rely on the fact that requests are grouped by 'load_from_file'.
    // But they might be interleaved if we had multiple files (we don't).
    //
    // Let's implement the "Decrement" strategy with a temporary array for the
    // current Section being processed? We process the queue sequentially. We
    // can maintain a transient list of (Section, Subject, SkippedCount). Given
    // MAX_CHILDREN is small, valid.
    //
    // BETTER:
    // Do this in 2 passes per Section.
    // Actually, let's just make it simple.
    // The "Quota" is defined by the grid content.
    // We need to associate unique requests to unique grid slots.
    //
    // Let's try:
    // For each request, scan grid.
    // If we find a match in the grid, we need to "mark" that grid slot as "used
    // for pruning" so we don't use it to prune the next request. But we can't
    // modify the grid strings easily.
    //
    // TRICK:
    // Pre-calculation:
    // Scan the grid of every section. Build a "Credit" count for each subject.
    // e.g. Sec_A: { Math: 2, Phy: 1 }
    // We can store this in a temporary structure or just recalculate.
    // recalculating is expensive (O(Q * G)). Queue ~200, Grid 40. 8000 ops.
    // Cheap.
    //
    // IMPLEMENTATION:
    // For each request `req`:
    //   int locks = count_occurrences(req.target_section, req.course_code);
    //   requests_seen_so_far(req.target_section, req.course_code);
    //   if (seen < locks) -> DROP (This request accounts for a lock)
    //   else -> KEEP (This request is needed)

    int locks = 0;
    TreeNode *sec = req.target_section;
    for (int d = 0; d < MAX_DAYS; d++) {
      for (int s = 0; s < MAX_SLOTS; s++) {
        if (sec->timetable->grid[d][s] &&
            strstr(sec->timetable->grid[d][s], req.course_code)) {
          locks++;
        }
      }
    }

    // Count how many prior requests for this same subject we have already
    // encounterd in this loop? We are building 'new_queue'. scan 'new_queue'?
    int kept_so_far = 0;
    QueueNode *temp = new_front;
    while (temp) {
      if (temp->req.target_section == req.target_section &&
          strcmp(temp->req.course_code, req.course_code) == 0) {
        kept_so_far++;
      }
      temp = temp->next;
    }

    // Wait, logic inversion.
    // If we have 4 requests total. Locks = 2.
    // Req 1: Kept=0. 0 < 2? No...
    //
    // Correct Logic:
    // We want to KEEP (Total - Locks).
    // We want to DROP (Locks).
    // We should DROP the *first* 'locks' requests we see.

    // We need to know how many we have *dropped* so far? OR just dropped.
    // Use a static list of "Dropped Counts"?
    //
    // Let's use the buffer idea.
    // Static array of structs { Section*, Subject[50], Count } to track DROPPED
    // count. Max combinations is roughly Semesters * Sections * Subjects ~ 50.

    static struct {
      TreeNode *sec;
      char sub[50];
      int dropped;
    } drop_history[500];
    static int h_count = 0;

    // Find existing history
    int h_idx = -1;
    for (int k = 0; k < h_count; k++) {
      if (drop_history[k].sec == req.target_section &&
          strcmp(drop_history[k].sub, req.course_code) == 0) {
        h_idx = k;
        break;
      }
    }
    if (h_idx == -1) {
      h_idx = h_count++;
      drop_history[h_idx].sec = req.target_section;
      strcpy(drop_history[h_idx].sub, req.course_code);
      drop_history[h_idx].dropped = 0;
    }

    if (drop_history[h_idx].dropped < locks) {
      // Drop this request (it matches a lock)
      drop_history[h_idx].dropped++;
      removed_count++;
      free(current); // Free the node
    } else {
      // Keep this request
      if (new_rear == NULL) {
        new_front = new_rear = current;
      } else {
        new_rear->next = current;
        new_rear = current;
      }
      // Sever the link to old next to be safe (will be overwritten if loop
      // continues, but good practice) But we must save current->next first.
    }

    QueueNode *next_node = current->next;
    current->next = NULL; // Safe
    current = next_node;
  }

  pipeline->front = new_front;
  pipeline->rear = new_rear;

  printf(">> [Pruner] Removed %d requests (Satisfied by locks). Pending: %d\n",
         removed_count, initial_count - removed_count);
}