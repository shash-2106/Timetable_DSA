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

  // 2. Teachers
  if (fscanf(f, "%d", &t_count) != 1)
    return;
  printf(">> [Loader] Reading %d teachers...\n", t_count);

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
        ScheduleRequest req;
        strcpy(req.course_code, sub_code);
        strcpy(req.type, sub_type);
        req.target_section = sections[i];
        enqueue(pipeline, req);
      }
    }
  }

  fclose(f);
  printf(">> [Loader] Configuration loaded successfully from %s.\n", filename);
}