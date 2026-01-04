#include "structures.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

// --- 1. LINKED LIST: Course Inventory ---
CourseNode* create_course_node(Course c) {
    CourseNode* newNode = (CourseNode*)malloc(sizeof(CourseNode));
    if (!newNode) return NULL;
    
    newNode->data = c;
    newNode->next = NULL;
    return newNode;
}

void append_course(CourseNode** head, Course c) {
    CourseNode* newNode = create_course_node(c);
    if (!newNode) return;
    
    if (*head == NULL) {
        *head = newNode;
        return;
    }
    CourseNode* temp = *head;
    while (temp->next != NULL) {
        temp = temp->next;
    }
    temp->next = newNode;
}

// --- 2. TREE: Hierarchical Organization ---
TreeNode* create_tree_node(const char* name, bool is_section) {
    TreeNode* newNode = (TreeNode*)malloc(sizeof(TreeNode));
    if (!newNode) return NULL;

    // Safety: Clear entire memory block to avoid garbage pointers
    memset(newNode, 0, sizeof(TreeNode));

    strncpy(newNode->name, name, 49);
    newNode->name[49] = '\0';
    newNode->child_count = 0;

    if (is_section) {
        newNode->timetable = (SectionTimetable*)malloc(sizeof(SectionTimetable));
        if (newNode->timetable) {
            memset(newNode->timetable, 0, sizeof(SectionTimetable));
            strncpy(newNode->timetable->section_name, name, 9);
            
            // Explicitly set all grid slots to NULL
            for(int i = 0; i < MAX_DAYS; i++) {
                for(int j = 0; j < MAX_SLOTS; j++) {
                    newNode->timetable->grid[i][j] = NULL;
                }
            }
        }
    } else {
        newNode->timetable = NULL;
    }
    return newNode;
}

// --- 3. QUEUE: Scheduling Pipeline ---
Queue* create_queue() {
    Queue* q = (Queue*)malloc(sizeof(Queue));
    if (!q) return NULL;
    q->front = q->rear = NULL;
    return q;
}

void enqueue(Queue* q, ScheduleRequest req) {
    QueueNode* newNode = (QueueNode*)malloc(sizeof(QueueNode));
    if (!newNode) return;
    
    newNode->req = req;
    newNode->next = NULL;
    
    if (q->rear == NULL) {
        q->front = q->rear = newNode;
        return;
    }
    q->rear->next = newNode;
    q->rear = newNode;
}

ScheduleRequest dequeue(Queue* q) {
    if (q == NULL || q->front == NULL) {
        ScheduleRequest empty;
        memset(&empty, 0, sizeof(ScheduleRequest));
        return empty;
    }
    
    QueueNode* temp = q->front;
    ScheduleRequest req = temp->req;
    
    q->front = q->front->next;
    if (q->front == NULL) {
        q->rear = NULL;
    }
    
    free(temp);
    return req;
}

// --- 4. STACK: Backtracking State ---
void push_assignment(StackNode** top, Assignment move) {
    StackNode* newNode = (StackNode*)malloc(sizeof(StackNode));
    if (!newNode) return;
    
    newNode->move = move;
    newNode->next = *top;
    *top = newNode;
}

Assignment pop_assignment(StackNode** top) {
    if (top == NULL || *top == NULL) {
        Assignment empty = {-1, -1, "", NULL};
        return empty;
    }
    
    StackNode* temp = *top;
    Assignment move = temp->move;
    *top = (*top)->next;
    
    free(temp);
    return move;
}