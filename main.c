#include "structures.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Global pointers
CourseNode* inventory = NULL;
TreeNode* root = NULL;
StackNode* history = NULL;
Queue* scheduling_pipeline = NULL;

// 1. Pipeline preparation: NOW INCLUDES PROFESSOR DATA
void prepare_pipeline(CourseNode* head, Queue* q, TreeNode* section, int year) {
    CourseNode* curr = head;
    while (curr != NULL) {
        // Handle Subjects (Lectures)
        if (!curr->data.needs_lab) {
            for (int i = 0; i < curr->data.lectures_per_week; i++) {
                ScheduleRequest req;
                req.duration = 1;
                req.target_section = section;
                strcpy(req.course_code, curr->data.code);
                // CRITICAL FIX: Transfer professor name to the request
                strcpy(req.prof_name, curr->data.prof.name); 
                enqueue(q, req);
            }
        } 
        // Handle Labs
        else {
            ScheduleRequest req;
            req.duration = 2;
            req.target_section = section;
            strcpy(req.course_code, curr->data.code);
            // CRITICAL FIX: Transfer professor name to the request
            strcpy(req.prof_name, curr->data.prof.name);
            enqueue(q, req);
        }
        curr = curr->next;
    }

    // Handle the mandatory EL slot
    ScheduleRequest el_req;
    strcpy(el_req.course_code, "EL");
    strcpy(el_req.prof_name, "None"); // EL usually has no specific shared professor constraint
    el_req.duration = (year == 1) ? 2 : 1;
    el_req.target_section = section;
    enqueue(q, el_req);
}

// 2. Recursive traversal to fill the queue
void schedule_all_sections(TreeNode* node, CourseNode* inv, Queue* q, int year) {
    if (node == NULL) return;

    if (node->timetable != NULL) {
        prepare_pipeline(inv, q, node, year);
    }

    for (int i = 0; i < 10; i++) {
        if (node->children[i] != NULL) {
            schedule_all_sections(node->children[i], inv, q, year);
        }
    }
}

// 3. Recursive traversal to print grids with Timings
void print_section_timetable(TreeNode* node) {
    if (node == NULL) return;
    
    // Updated timings based on your specific 9:00 - 4:30 schedule
    char* timings[] = {
        "09:00", "10:00", "11:00", "11:30", "12:30", "01:30", "02:30", "03:30"
    };

    if (node->timetable != NULL) {
        printf("\nTIMETABLE FOR: %s\n", node->name);
        printf("------------------------------------------------------------------------------------------------------------\n");
        printf("       ");
        for(int i = 0; i < 8; i++) printf("| %s ", timings[i]);
        printf("|\n");

        for (int d = 0; d < MAX_DAYS; d++) {
            char* day_names[] = {"MON", "TUE", "WED", "THU", "FRI"};
            printf("%s    ", day_names[d]);
            for (int s = 0; s < 8; s++) {
                if (s == 2) 
                    printf("| BREAK ");
                else if (s == 5)
                    printf("| LUNCH ");
                else if (node->timetable->grid[d][s] == NULL)
                    printf("|   -   ");
                else
                    printf("| %-5s ", node->timetable->grid[d][s]);
            }
            printf("|\n");
        }
        printf("------------------------------------------------------------------------------------------------------------\n");
    }

    for (int i = 0; i < 10; i++) {
        if (node->children[i] != NULL) print_section_timetable(node->children[i]);
    }
}

int main() {
    printf("--- DSA Timetable Generator (C Version) ---\n");
    printf("Academic Format: 5 Subjects, 4 Labs, 1 EL Slot\n\n");

    scheduling_pipeline = create_queue();

    // Load data into Tree and Inventory
    load_department_data("input/test_input1.txt", &inventory, &root);

    if (root == NULL) {
        printf("CRITICAL ERROR: Data loading failed.\n");
        return 1;
    }

    // Build the SINGLE global queue for ALL 5 sections
    int current_year = 2; 
    schedule_all_sections(root, inventory, scheduling_pipeline, current_year);

    printf("Running Global Backtracking Solver...\n");
    // This call now processes everything, checking cross-section professor busy-ness
    if (solve_timetable(scheduling_pipeline, &history)) {
        printf("\nSUCCESS: All sections synchronized without professor clashes!\n");
        print_section_timetable(root);
    } else {
        printf("\nFAILURE: Could not find a valid schedule for all professors.\n");
    }

    return 0;
}