#ifndef STRUCTURES_H
#define STRUCTURES_H

#include <stdbool.h>

#define MAX_DAYS 5
#define MAX_SLOTS 10

// Forward declaration
struct TreeNode; 

typedef struct {
    char name[50];
    char code[10];
} Professor;

typedef struct {
    char code[10];
    Professor prof;
    int lectures_per_week;
    bool needs_lab;
} Course;

typedef struct CourseNode {
    Course data;
    struct CourseNode* next;
} CourseNode;

typedef struct {
    char section_name[10];
    char* grid[MAX_DAYS][MAX_SLOTS];
} SectionTimetable;

typedef struct TreeNode {
    char name[50];
    struct TreeNode* children[10];
    int child_count;
    SectionTimetable* timetable;
} TreeNode;

// Consistency Fix: Use 'target_section' in both
typedef struct ScheduleRequest {
    char course_code[10];
    char prof_name[50]; // <--- Add this
    int duration;
    struct TreeNode* target_section;
} ScheduleRequest;

typedef struct {
    int day;
    int slot;
    char course_code[10];
    struct TreeNode* target_section; 
} Assignment;


typedef struct QueueNode {
    ScheduleRequest req;
    struct QueueNode* next;
} QueueNode;

typedef struct {
    QueueNode *front, *rear;
} Queue;



typedef struct StackNode {
    Assignment move;
    struct StackNode* next;
} StackNode;

#endif
CourseNode* create_course_node(Course c);
void append_course(CourseNode** head, Course c);

TreeNode* create_tree_node(const char* name, bool is_section);

Queue* create_queue();
void enqueue(Queue* q, ScheduleRequest req);
ScheduleRequest dequeue(Queue* q); // The one that fixed your error!

void push_assignment(StackNode** top, Assignment move);
Assignment pop_assignment(StackNode** top);

// Scheduling Logic
bool solve_timetable(Queue* pending_reqs, StackNode** history);
bool is_subject_on_day(SectionTimetable* tt, char* code, int day);

void load_department_data(const char* filename, CourseNode** inventory, TreeNode** root);