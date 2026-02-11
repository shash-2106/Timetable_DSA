#ifndef STRUCTURES_H
#define STRUCTURES_H

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_DAYS 5
#define MAX_SLOTS 8
#define MAX_CHILDREN 20
#define MAX_EXPERTISE 30

typedef struct {
  char name[50];
  char expertise[MAX_EXPERTISE][50]; // List of subject codes they can teach
  int expertise_count;
} Professor;

typedef struct {
  char branch_name[50];
  Professor teachers[50];
  int teacher_count;
} BranchData;

typedef struct {
  char *grid[MAX_DAYS][MAX_SLOTS];
} SectionTimetable;

typedef enum {
  ROOT_COLLEGE,
  BRANCH_NODE,
  SEMESTER_NODE,
  SECTION_NODE
} NodeType;

typedef struct TreeNode {
  char name[50];
  NodeType type;
  struct TreeNode *children[MAX_CHILDREN];
  int child_count;
  BranchData *branch_info;
  SectionTimetable *timetable;
} TreeNode;

typedef struct {
  char course_code[50];
  char type[15];
  char prof_name[50];
  TreeNode *target_section;
} ScheduleRequest;

typedef struct QueueNode {
  ScheduleRequest req;
  struct QueueNode *next;
} QueueNode;

typedef struct {
  QueueNode *front, *rear;
} Queue;

typedef struct {
  int subjects_placed;
} SolverHistory;

// Function Prototypes remains the same but add_teacher_to_branch loses a
// parameter
TreeNode *create_tree_node(const char *name, NodeType type);
void add_child(TreeNode *parent, TreeNode *child);
Queue *create_queue();
void enqueue(Queue *q, ScheduleRequest req);
ScheduleRequest dequeue(Queue *q);
TreeNode *add_branch_to_college(TreeNode *root, const char *name);
TreeNode *add_semester_to_branch(TreeNode *branch, const char *name);
TreeNode *add_section_to_semester(TreeNode *sem, const char *name);
void add_teacher_to_branch(TreeNode *branch, char *name); // Removed 'load'
void admin_wizard(TreeNode *root, Queue *pipeline);
void load_from_file(TreeNode *root, Queue *pipeline, const char *filename);
bool validate_teacher(TreeNode *b, char *name);
bool is_teacher_busy(TreeNode *branch, char *name, int d, int s);
bool solve_branch_timetable(TreeNode *root, Queue *pipeline,
                            SolverHistory *history);
void display_section_timetable(TreeNode *root, char *branch, char *section);
void export_to_json(TreeNode *root, const char *filename);
void get_teacher_view(TreeNode *node, char *name, char *parent_name);
void load_locks(TreeNode *root, const char *filename);
void prune_pipeline(TreeNode *root, Queue *pipeline);
TreeNode *find_child_by_name(TreeNode *parent, const char *name, NodeType type);
int validate_and_assign_temporary_slot(TreeNode *college_root,
                                       TreeNode *target_section,
                                       char *course_code, char *type,
                                       char *teacher_name, int day, int slot);

#endif