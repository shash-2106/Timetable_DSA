#include "structures.h"
#include <ctype.h>

// Windows uses _strnicmp instead of strncasecmp
#ifdef _WIN32
#define strncasecmp _strnicmp
#endif

// Portable case-insensitive substring search (strcasestr is not available on Windows)
static char *portable_strcasestr(const char *haystack, const char *needle) {
    if (!needle || !*needle) return (char *)haystack;
    if (!haystack) return NULL;
    
    size_t needle_len = strlen(needle);
    while (*haystack) {
        if (strncasecmp(haystack, needle, needle_len) == 0) {
            return (char *)haystack;
        }
        haystack++;
    }
    return NULL;
}

// Helper to handle NULL strings in JSON
// Helper to handle NULL strings and escape special chars for JSON
const char *json_safe(char *str) {
  if (str == NULL)
    return "FREE";

  static char buffer[256]; // Static buffer for simplicity in this
                           // single-threaded context
  int j = 0;
  for (int i = 0; str[i] != '\0' && j < 250; i++) {
    if (str[i] == '\n') {
      buffer[j++] = '\\';
      buffer[j++] = 'n';
    } else if (str[i] == '"') {
      buffer[j++] = '\\';
      buffer[j++] = '"';
    } else {
      buffer[j++] = str[i];
    }
  }
  buffer[j] = '\0';
  return buffer;
}
void get_teacher_view(TreeNode *node, char *name, char *parent_name) {
  if (node == NULL)
    return;

  printf("[Audit] Visiting: %s (Type: %d, Children: %d)\n", node->name,
         node->type, node->child_count);
  // --- HEARTBEAT DEBUG ---
  // This will tell us if the search is actually hitting the sections
  if (node->type == SECTION_NODE) {
    printf("  [System] Checking Section: %s\n", node->name);
  }

  if (node->type == SECTION_NODE && node->timetable != NULL) {
    for (int d = 0; d < MAX_DAYS; d++) {
      for (int s = 0; s < MAX_SLOTS; s++) {
        char *entry = node->timetable->grid[d][s];

        // Use portable case-insensitive search
        if (entry != NULL && portable_strcasestr(entry, name) != NULL) {
          char *days[] = {"Mon", "Tue", "Wed", "Thu", "Fri"};
          printf("  >> [%s | %s] %s | Slot %d | %s\n", parent_name, node->name,
                 days[d], s + 1, entry);
        }
      }
    }
  }

  // Recurse through all children
  for (int i = 0; i < node->child_count; i++) {
    get_teacher_view(node->children[i], name, node->name);
  }
}
void write_node_json(TreeNode *node, FILE *f) {
  if (!node)
    return;

  fprintf(f, "{ \"name\": \"%s\", \"type\": %d, \"children\": [", node->name,
          (int)node->type);

  // 1. Recursive call for all children (Sems, Sections, etc.)
  for (int i = 0; i < node->child_count; i++) {
    write_node_json(node->children[i], f);
    if (i < node->child_count - 1)
      fprintf(f, ",");
  }
  fprintf(f, "]");

  // 2. CRITICAL: Export the Student Grid if this is a Section Node
  if (node->type == SECTION_NODE && node->timetable != NULL) {
    fprintf(f, ", \"grid\": [");
    for (int d = 0; d < MAX_DAYS; d++) {
      fprintf(f, "[");
      for (int s = 0; s < MAX_SLOTS; s++) {
        fprintf(f, "{ \"content\": \"%s\", \"isFixed\": %s }%s",
                json_safe(node->timetable->grid[d][s]),
                node->timetable->is_fixed[d][s] ? "true" : "false",
                (s == MAX_SLOTS - 1 ? "" : ","));
      }
      fprintf(f, "]%s", (d == MAX_DAYS - 1 ? "" : ","));
    }
    fprintf(f, "]");
  }

  fprintf(f, "}");
}

void export_to_json(TreeNode *root, const char *filename) {
  FILE *f = fopen(filename, "w");
  if (!f) {
    printf("Error: Could not open %s for writing.\n", filename);
    return;
  }

  // Start recursion from the very top (University Root)
  write_node_json(root, f);

  fclose(f);
  printf(
      "\n>> [Export] Master data (Teachers + All Section Grids) saved to %s\n",
      filename);
}