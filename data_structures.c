#include "structures.h"

TreeNode* create_tree_node(const char* name, NodeType type) {
    TreeNode* newNode = (TreeNode*)malloc(sizeof(TreeNode));
    if (!newNode) return NULL;
    memset(newNode, 0, sizeof(TreeNode));
    strncpy(newNode->name, name, 49);
    newNode->type = type;

    if (type == SECTION_NODE) {
        newNode->timetable = (SectionTimetable*)malloc(sizeof(SectionTimetable));
        for(int i=0; i<MAX_DAYS; i++)
            for(int j=0; j<MAX_SLOTS; j++) newNode->timetable->grid[i][j] = NULL;
    } else if (type == BRANCH_NODE) {
        newNode->branch_info = (BranchData*)malloc(sizeof(BranchData));
        newNode->branch_info->teacher_count = 0;
    }
    return newNode;
}

void add_child(TreeNode* parent, TreeNode* child) {
    if (parent->child_count < MAX_CHILDREN) {
        parent->children[parent->child_count] = child;
        parent->child_count++; // <--- If this is missing, children: 0
    }
}

Queue* create_queue() {
    Queue* q = (Queue*)malloc(sizeof(Queue));
    q->front = q->rear = NULL;
    return q;
}

void enqueue(Queue* q, ScheduleRequest req) {
    QueueNode* newNode = (QueueNode*)malloc(sizeof(QueueNode));
    newNode->req = req;
    newNode->next = NULL;
    if (q->rear == NULL) {
        q->front = q->rear = newNode;
    } else {
        q->rear->next = newNode;
        q->rear = newNode;
    }
}

ScheduleRequest dequeue(Queue* q) {
    if (q->front == NULL) {
        ScheduleRequest empty = {"", "", NULL};
        return empty;
    }
    QueueNode* temp = q->front;
    ScheduleRequest req = temp->req;
    q->front = q->front->next;
    if (q->front == NULL) q->rear = NULL;
    free(temp);
    return req;
}