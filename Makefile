# Compiler settings
CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -g

# Target executable name
TARGET = timetable_system

# Source files
SRCS = main.c data_structures.c parser.c scheduler.c web_bridge.c

# Object files (automatically generated from SRCS)
OBJS = $(SRCS:.c=.o)

# Header files
DEPS = structures.h

# Default rule: build the program
all: $(TARGET)

# Link the object files into the final executable
$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJS)
	@echo ">> Compilation successful. Run with: ./${TARGET}"

# Compile individual source files into object files
%.o: %.c $(DEPS)
	$(CC) $(CFLAGS) -c $< -o $@

# Clean rule: remove compiled files
clean:
	rm -f $(OBJS) $(TARGET)
	@echo ">> Cleanup complete."

# Run rule: compile and run immediately
run: all
	./$(TARGET)