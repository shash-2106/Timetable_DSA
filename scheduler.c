#include "structures.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// External links to globals defined in main.c
extern TreeNode* root;
extern CourseNode* inventory;

// --- 1. HELPER: Get Professor Name for a Course Code ---
// This allows the professor check to work even if we only have the code in the grid
char* get_prof_for_code(char* code) {
    if (code == NULL) return "None";
    CourseNode* curr = inventory;
    while (curr != NULL) {
        if (strcmp(curr->data.code, code) == 0) {
            return curr->data.prof.name;
        }
        curr = curr->next;
    }
    return "None";
}

// --- 2. HELPER: Check if Subject is already on this Day ---
bool is_subject_on_day(SectionTimetable* st, char* code, int day) {
    for (int s = 0; s < MAX_SLOTS; s++) {
        // Only look at the grid of the specific section passed to this function
        if (st->grid[day][s] != NULL && strcmp(st->grid[day][s], code) == 0) {
            return true;
        }
    }
    return false;
}

// --- 3. HELPER: Global Professor Conflict Check ---
// Recursively searches the entire tree to see if a professor is teaching elsewhere
bool is_professor_busy(TreeNode* node, char* prof_name, int day, int slot, int duration, TreeNode* target_section) {
    if (node == NULL || strcmp(prof_name, "None") == 0) return false;

    // Check if this node is a Section and NOT the one we are currently filling
    if (node->timetable != NULL && node != target_section) {
        for (int i = 0; i < duration; i++) {
            int current_slot = slot + i;
            if (current_slot >= MAX_SLOTS) continue;

            char* code_in_grid = node->timetable->grid[day][current_slot];
            if (code_in_grid != NULL) {
                // Check if the professor assigned to the code in this slot matches
                if (strcmp(get_prof_for_code(code_in_grid), prof_name) == 0) {
                    return true; // Professor is busy in another section!
                }
            }
        }
    }

    // Traverse the rest of the tree
    for (int i = 0; i < 10; i++) {
        if (node->children[i] != NULL) {
            if (is_professor_busy(node->children[i], prof_name, day, slot, duration, target_section))
                return true;
        }
    }
    return false;
}

// --- 4. CORE: Backtracking Solver ---
bool solve_timetable(Queue* pending_reqs, StackNode** history) {
    // Base Case: All requests handled
    if (pending_reqs->front == NULL) return true;

    // Get the next request from the queue
    ScheduleRequest current = dequeue(pending_reqs);
    SectionTimetable* st = current.target_section->timetable;

    for (int d = 0; d < MAX_DAYS; d++) {
        for (int s = 0; s <= MAX_SLOTS - current.duration; s++) {
                if (s == 2 || s == 5) continue;

                // Check if a multi-hour class (like a Lab) would overlap into a break
                // e.g., if a 2-hour lab starts at Index 1 (10:00), it would hit Index 2 (11:00)
                bool overlaps_break = false;
                for (int i = 0; i < current.duration; i++) {
                    if ((s + i) == 2 || (s + i) == 5) {
                        overlaps_break = true;
                        break;
                    }
                }
                if (overlaps_break) continue;
            // LUNCH BREAK CONSTRAINT: Skip the 5th slot (Index 4)
            // If the class starts at lunch or overlaps into lunch, skip it

            if (s == 4 || (s < 4 && s + current.duration > 4)) continue;

            // Check if slots are physically empty
            bool slots_free = true;
            for (int i = 0; i < current.duration; i++) {
                if (st->grid[d][s + i] != NULL) {
                    slots_free = false;
                    break;
                }
            }

            // Apply all constraints
            if (slots_free && 
                !is_subject_on_day(st, current.course_code, d) && 
                !is_professor_busy(root, current.prof_name, d, s, current.duration, current.target_section)) {
                
                // 1. Assign to grid
                for (int i = 0; i < current.duration; i++) {
                    st->grid[d][s + i] = strdup(current.course_code);
                }

                // 2. Push to Stack (for backtracking)
                Assignment move = {d, s, "", current.target_section};
                strcpy(move.course_code, current.course_code);
                push_assignment(history, move);

                // 3. Recursive call for next request
                if (solve_timetable(pending_reqs, history)) return true;

                // 4. Backtrack: If path failed, undo the assignment
                for (int i = 0; i < current.duration; i++) {
                    if (st->grid[d][s + i] != NULL) {
                        free(st->grid[d][s + i]);
                        st->grid[d][s + i] = NULL;
                    }
                }
                pop_assignment(history);
            }
        }
    }

    // If no slot works, put request back and return failure to previous recursion level
    // (In a more advanced queue, you'd re-enqueue at the front)
    return false; 
}