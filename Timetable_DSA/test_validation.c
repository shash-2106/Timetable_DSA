#include "structures.h"
#include <assert.h>

int main() {
  printf(">> [Test] Starting Validation Logic Test...\n");

  // 1. Setup Mock Data
  TreeNode *university = create_tree_node("University", ROOT_COLLEGE);
  TreeNode *branch = add_branch_to_college(university, "CSE");
  TreeNode *sem = add_semester_to_branch(branch, "Sem1");
  TreeNode *sec = add_section_to_semester(sem, "Sec_A");

  // Add a teacher
  add_teacher_to_branch(branch, "Prof_Test");

  // 2. Test 1: Assign to Empty Slot (Should Success - 0)
  int res1 = validate_and_assign_temporary_slot(university, sec, "Math",
                                                "Lecture", "Prof_Test", 0, 0);
  printf("Test 1 (Success): Result = %d (Expected 0)\n", res1);
  assert(res1 == 0);

  // 3. Test 2: Assign to Occupied Slot (Should Fail - 1)
  int res2 = validate_and_assign_temporary_slot(university, sec, "Physics",
                                                "Lecture", "Prof_Test", 0, 0);
  printf("Test 2 (Slot Full): Result = %d (Expected 1)\n", res2);
  assert(res2 == 1);

  // 4. Test 3: Teacher Busy (Should Fail - 2)
  TreeNode *secB = add_section_to_semester(sem, "Sec_B");
  int res3 = validate_and_assign_temporary_slot(university, secB, "Chemistry",
                                                "Lecture", "Prof_Test", 0, 0);
  printf("Test 3 (Teacher Busy): Result = %d (Expected 2)\n", res3);
  assert(res3 == 2);

  // 5. Test 4: Break Slot (Should Fail - 3)
  int res4 = validate_and_assign_temporary_slot(university, sec, "Sports",
                                                "Lecture", "Prof_Test", 0, 2);
  printf("Test 4 (Break Slot): Result = %d (Expected 3)\n", res4);
  assert(res4 == 3);

  printf(">> [Test] All tests passed!\n");
  return 0;
}
