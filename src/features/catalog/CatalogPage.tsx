import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { BookOpen, Star, Clock, Code2, X, CheckCircle2, PlayCircle, Users, Calendar, Award, ChevronDown } from 'lucide-react';

const courses = [
  {
    id: 'python-101',
    title: 'Python for Beginners',
    description: 'Master the basics of Python programming. Perfect for absolute beginners.',
    level: 'Beginner',
    language: 'Python',
    duration: '4h',
    lessons: 24,
    rating: 4.9,
    color: '#3b82f6',
    instructor: 'Dr. Angela Yu',
    studentsEnrolled: 142530,
    lastUpdated: 'Oct 2025',
    skillsGained: ['Python Syntax', 'Data Structures', 'Functions', 'Basic Scripts'],
    syllabus: [
      { title: 'Introduction to Python and Setup', description: 'Install Python, set up your development environment, and write your first Hello World script.' },
      { title: 'Variables, Data Types, and Operators', description: 'Learn how to store data using variables, understand strings, integers, floats, and basic math operations.' },
      { title: 'Control Flow: If Statements and Loops', description: 'Control the logic of your programs using conditionals and loop through data using for and while loops.' },
      { title: 'Functions and Modules', description: 'Write reusable code blocks using functions and learn to import external modules and libraries.' },
      { title: 'Working with Lists, Dictionaries, and Tuples', description: 'Master Python\'s built-in data structures to organize and manipulate collections of data effectively.' }
    ]
  },
  {
    id: 'js-advanced',
    title: 'JavaScript Async & Promises',
    description: 'Deep dive into asynchronous JavaScript, promises, and the event loop.',
    level: 'Advanced',
    language: 'JavaScript',
    duration: '3h',
    lessons: 15,
    rating: 4.8,
    color: '#f59e0b',
    instructor: 'Kyle Simpson',
    studentsEnrolled: 89420,
    lastUpdated: 'Nov 2025',
    skillsGained: ['Promises', 'Async/Await', 'Event Loop', 'Error Handling'],
    syllabus: [
      { title: 'The Event Loop Explained', description: 'Understand the core mechanism of how JavaScript handles asynchronous operations under the hood.' },
      { title: 'Callbacks and Callback Hell', description: 'Explore the classic callback pattern and understand why it can lead to unmanageable nested code.' },
      { title: 'Promises and Chaining', description: 'Learn to use Promises to handle async results cleanly and chain multiple async operations.' },
      { title: 'Async/Await Syntax', description: 'Master the modern ES8 async/await syntax to write asynchronous code that looks and behaves like synchronous code.' },
      { title: 'Error Handling in Asynchronous Code', description: 'Implement robust try/catch blocks to gracefully catch and handle network or logic errors in async flows.' }
    ]
  },
  {
    id: 'cpp-dsa',
    title: 'Data Structures in C++',
    description: 'Learn arrays, linked lists, and trees from scratch using C++.',
    level: 'Intermediate',
    language: 'C++',
    duration: '6h',
    lessons: 32,
    rating: 4.9,
    color: '#6366f1',
    instructor: 'Abdul Bari',
    studentsEnrolled: 215600,
    lastUpdated: 'Dec 2025',
    skillsGained: ['Pointers', 'Memory Management', 'Trees', 'Graphs'],
    syllabus: [
      { title: 'Introduction to Data Structures', description: 'Understand time and space complexity (Big O notation) and why data structures matter.' },
      { title: 'Arrays and Dynamic Arrays (Vectors)', description: 'Work with contiguous memory, understand array limitations, and implement dynamic vectors.' },
      { title: 'Linked Lists: Singly and Doubly', description: 'Build self-referential nodes and implement fast insertions and deletions using Linked Lists.' },
      { title: 'Stacks and Queues Implementation', description: 'Create LIFO and FIFO data structures from scratch and explore their real-world applications.' },
      { title: 'Binary Trees and BSTs', description: 'Implement hierarchical data structures, tree traversals, and Binary Search Trees for fast lookups.' }
    ]
  },
  {
    id: 'sql-basics',
    title: 'SQL Fundamentals',
    description: 'Learn how to query databases and manage data effectively.',
    level: 'Beginner',
    language: 'SQL',
    duration: '2h',
    lessons: 12,
    rating: 4.7,
    color: '#22c55e',
    instructor: 'Jose Portilla',
    studentsEnrolled: 305100,
    lastUpdated: 'Sep 2025',
    skillsGained: ['Querying Data', 'Joins', 'Aggregations', 'Database Design'],
    syllabus: [
      { title: 'Introduction to Databases and Tables', description: 'Learn the principles of Relational Databases and how data is structured into tables.' },
      { title: 'SELECT Queries and Filtering (WHERE)', description: 'Extract specific data from a table and use comparison operators to filter records.' },
      { title: 'Sorting and Grouping Data (ORDER BY, GROUP BY)', description: 'Organize your results and use aggregate functions like COUNT, SUM, and AVG.' },
      { title: 'Joining Tables (INNER, LEFT, RIGHT)', description: 'Combine data across multiple tables using relational foreign keys and JOIN clauses.' },
      { title: 'Inserting, Updating, and Deleting Data', description: 'Modify the data in your database safely using INSERT, UPDATE, and DELETE commands.' }
    ]
  },
  {
    id: 'react-hooks',
    title: 'Mastering React Hooks',
    description: 'Understand state management and side effects in modern React applications.',
    level: 'Intermediate',
    language: 'React',
    duration: '3h',
    lessons: 18,
    rating: 4.9,
    color: '#06b6d4',
    instructor: 'Dan Abramov',
    studentsEnrolled: 184200,
    lastUpdated: 'Jan 2026',
    skillsGained: ['useState', 'useEffect', 'Custom Hooks', 'Context API'],
    syllabus: [
      { title: 'Introduction to Functional Components', description: 'Transition from class-based components to modern functional components.' },
      { title: 'Managing State with useState', description: 'Learn to track internal component data and trigger re-renders safely.' },
      { title: 'Handling Side Effects with useEffect', description: 'Connect to external APIs, set up subscriptions, and manage the component lifecycle.' },
      { title: 'Context API and useContext', description: 'Avoid prop-drilling by sharing global state across your entire React application.' },
      { title: 'Building Custom Hooks', description: 'Extract and reuse stateful logic by creating your own modular Custom Hooks.' }
    ]
  },
  {
    id: 'c-basics',
    title: 'C Programming Basics',
    description: 'Learn the fundamentals of C programming, including variables, loops, and pointers.',
    level: 'Beginner',
    language: 'C',
    duration: '5h',
    lessons: 20,
    rating: 4.8,
    color: '#3b82f6',
    instructor: 'Brian Kernighan',
    studentsEnrolled: 92400,
    lastUpdated: 'Aug 2025',
    skillsGained: ['Memory Management', 'Pointers', 'Structs', 'Control Flow'],
    syllabus: [
      { title: 'Setting up a C Environment', description: 'Install a C compiler (GCC) and write your very first compiled program.' },
      { title: 'Variables, Data Types, and Operators', description: 'Understand basic types, type casting, and how C handles basic arithmetic.' },
      { title: 'Control Structures (if/else, loops)', description: 'Build program logic with conditionals and iterate with for and while loops.' },
      { title: 'Functions and Recursion', description: 'Modularize your code into functions and understand the call stack and recursion.' },
      { title: 'Introduction to Pointers and Memory', description: 'Unlock the true power of C by directly manipulating memory addresses using pointers.' }
    ]
  },
  {
    id: 'cpp-basics',
    title: 'C++ Fundamentals',
    description: 'Master the basics of C++ including object-oriented programming concepts.',
    level: 'Beginner',
    language: 'C++',
    duration: '6h',
    lessons: 25,
    rating: 4.9,
    color: '#6366f1',
    instructor: 'Bjarne Stroustrup',
    studentsEnrolled: 110500,
    lastUpdated: 'Nov 2025',
    skillsGained: ['OOP', 'Classes & Objects', 'STL Basics', 'References'],
    syllabus: [
      { title: 'C++ Syntax and Basic I/O', description: 'Learn the syntax differences from C and use streams (cin/cout) for input and output.' },
      { title: 'Variables and Control Flow', description: 'Master C++ variable declarations, typing, and complex control structures.' },
      { title: 'Functions and Pass-by-Reference', description: 'Pass parameters efficiently using references and explore function overloading.' },
      { title: 'Classes and Objects (OOP)', description: 'Encapsulate logic and data into classes, the core paradigm of C++.' },
      { title: 'Constructors and Destructors', description: 'Manage object lifecycles, initialize data securely, and clean up memory.' }
    ]
  },
  {
    id: 'java-basics',
    title: 'Java for Beginners',
    description: 'A comprehensive introduction to Java, covering syntax, OOP, and standard libraries.',
    level: 'Beginner',
    language: 'Java',
    duration: '7h',
    lessons: 30,
    rating: 4.7,
    color: '#ef4444',
    instructor: 'Tim Buchalka',
    studentsEnrolled: 275000,
    lastUpdated: 'Jan 2026',
    skillsGained: ['Java Syntax', 'JVM', 'Object Oriented Programming', 'Collections'],
    syllabus: [
      { title: 'Java Basics and the JVM', description: 'Understand "Write Once, Run Anywhere" and set up your Java Development Kit (JDK).' },
      { title: 'Variables, Strings, and Arrays', description: 'Work with strictly typed variables, memory structures, and the powerful String class.' },
      { title: 'Classes, Objects, and Methods', description: 'Dive deep into Java\'s object-oriented nature by designing robust classes.' },
      { title: 'Inheritance and Polymorphism', description: 'Extend classes, override methods, and write flexible, dynamic object systems.' },
      { title: 'Exception Handling', description: 'Build crash-resistant applications using try/catch/finally blocks and custom exceptions.' }
    ]
  },
  {
    id: 'js-basics',
    title: 'JavaScript Basics',
    description: 'Start your web development journey by learning core JavaScript concepts.',
    level: 'Beginner',
    language: 'JavaScript',
    duration: '4h',
    lessons: 18,
    rating: 4.9,
    color: '#f59e0b',
    instructor: 'Jonas Schmedtmann',
    studentsEnrolled: 310200,
    lastUpdated: 'Feb 2026',
    skillsGained: ['DOM Manipulation', 'ES6 Syntax', 'Functions', 'Arrays'],
    syllabus: [
      { title: 'Introduction to JavaScript and the DOM', description: 'Learn how JS interacts with HTML to create dynamic, interactive webpages.' },
      { title: 'Variables (let/const) and Data Types', description: 'Understand ES6 variable declarations and JavaScript\'s dynamic typing system.' },
      { title: 'Functions and Arrow Functions', description: 'Write functions and master the concise ES6 arrow function syntax.' },
      { title: 'Arrays and Array Methods', description: 'Store lists of data and transform them using map, filter, and reduce.' },
      { title: 'Objects and JSON', description: 'Model real-world entities using Objects and communicate with servers using JSON.' }
    ]
  },
  {
    id: 'go-basics',
    title: 'Go Fundamentals',
    description: 'Learn Google\'s Go programming language, designed for simplicity and concurrency.',
    level: 'Beginner',
    language: 'Go',
    duration: '5h',
    lessons: 22,
    rating: 4.8,
    color: '#0ea5e9',
    instructor: 'Todd McLeod',
    studentsEnrolled: 82000,
    lastUpdated: 'Dec 2025',
    skillsGained: ['Concurrency', 'Goroutines', 'Channels', 'Structs'],
    syllabus: [
      { title: 'Go Syntax and Program Structure', description: 'Set up your Go workspace and write your first compiled Go binary.' },
      { title: 'Variables, Types, and Structs', description: 'Learn Go\'s strict typing, short variable declarations, and composite data structures.' },
      { title: 'Control Flow and Functions', description: 'Use Go\'s simplified loops and write functions capable of returning multiple values.' },
      { title: 'Pointers in Go', description: 'Pass references to memory efficiently without the complexity of C-style pointer arithmetic.' },
      { title: 'Introduction to Goroutines', description: 'Unlock extreme performance by running concurrent lightweight threads using Goroutines.' }
    ]
  },
  {
    id: 'rust-basics',
    title: 'Rust Basics',
    description: 'Discover safe and fast systems programming with the Rust programming language.',
    level: 'Beginner',
    language: 'Rust',
    duration: '6h',
    lessons: 28,
    rating: 4.9,
    color: '#f97316',
    instructor: 'Nathan Stocks',
    studentsEnrolled: 95400,
    lastUpdated: 'Jan 2026',
    skillsGained: ['Ownership', 'Borrowing', 'Lifetimes', 'Cargo'],
    syllabus: [
      { title: 'Hello Rust and Cargo Tooling', description: 'Install Rust, understand its strict compiler, and manage dependencies with Cargo.' },
      { title: 'Variables and Mutability', description: 'Learn why Rust variables are immutable by default and how to safely change data.' },
      { title: 'Data Types and Control Flow', description: 'Work with scalar and compound types, and master the powerful "match" statement.' },
      { title: 'Understanding Ownership and Borrowing', description: 'Conquer Rust\'s most unique feature to guarantee memory safety without a garbage collector.' },
      { title: 'Structs and Enums', description: 'Model complex data schemas using structs and expressive enumerations.' }
    ]
  },
  {
    id: 'ruby-basics',
    title: 'Ruby for Beginners',
    description: 'Learn Ruby, a dynamic, open source programming language with a focus on simplicity.',
    level: 'Beginner',
    language: 'Ruby',
    duration: '3h',
    lessons: 15,
    rating: 4.7,
    color: '#be123c',
    instructor: 'Boris Paskhaver',
    studentsEnrolled: 42000,
    lastUpdated: 'Jul 2025',
    skillsGained: ['Ruby Syntax', 'Blocks & Procs', 'Hashes', 'Modules'],
    syllabus: [
      { title: 'Ruby Syntax and Interactive Ruby (IRB)', description: 'Write elegant, readable code and test logic instantly using the IRB terminal.' },
      { title: 'Numbers, Strings, and Symbols', description: 'Understand Ruby\'s object model where everything is an object, including primitive numbers.' },
      { title: 'Arrays and Hashes', description: 'Organize data sequentially or as key-value pairs using Ruby\'s powerful collection methods.' },
      { title: 'Methods and Blocks', description: 'Define methods and pass anonymous blocks of code to create flexible, higher-order functions.' },
      { title: 'Classes and Modules', description: 'Embrace Ruby\'s pure object-oriented design and use modules as mixins.' }
    ]
  },
  {
    id: 'csharp-basics',
    title: 'C# Basics',
    description: 'Start building Windows apps and games by learning the fundamentals of C#.',
    level: 'Beginner',
    language: 'C#',
    duration: '5h',
    lessons: 24,
    rating: 4.8,
    color: '#8b5cf6',
    instructor: 'Mosh Hamedani',
    studentsEnrolled: 154000,
    lastUpdated: 'Oct 2025',
    skillsGained: ['C# Syntax', '.NET Core', 'LINQ', 'Interfaces'],
    syllabus: [
      { title: 'C# and the .NET Framework', description: 'Understand the .NET ecosystem, set up Visual Studio, and compile a C# console app.' },
      { title: 'Data Types and Variables', description: 'Learn C# types, type conversion, and work with strings and date times.' },
      { title: 'Control Structures and Loops', description: 'Control the flow of your program logic using if-else, switch cases, and iteration.' },
      { title: 'Methods and Parameters', description: 'Organize code into methods and understand value vs reference type parameters.' },
      { title: 'Object-Oriented Programming in C#', description: 'Master classes, inheritance, and interfaces to build scalable application architectures.' }
    ]
  },
  {
    id: 'ts-basics',
    title: 'TypeScript Fundamentals',
    description: 'Add static typing to your JavaScript code and build robust web applications.',
    level: 'Beginner',
    language: 'TypeScript',
    duration: '4h',
    lessons: 16,
    rating: 4.9,
    color: '#2563eb',
    instructor: 'Stephen Grider',
    studentsEnrolled: 132000,
    lastUpdated: 'Feb 2026',
    skillsGained: ['Static Typing', 'Interfaces', 'Generics', 'Type Aliases'],
    syllabus: [
      { title: 'Why TypeScript? Compilation and Setup', description: 'Understand how TypeScript catches errors at compile-time and configures tsconfig.json.' },
      { title: 'Basic Types and Type Inference', description: 'Annotate primitive types and let TypeScript infer types automatically for cleaner code.' },
      { title: 'Interfaces and Type Aliases', description: 'Define custom shapes for objects and combine types using unions and intersections.' },
      { title: 'Functions and Generics', description: 'Add strict types to function arguments/returns and build reusable, generic components.' },
      { title: 'Classes and Access Modifiers', description: 'Utilize public, private, and protected modifiers to enforce data encapsulation in classes.' }
    ]
  }
];

export default function CatalogPage() {
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);
  const [filter, setFilter] = useState('All');
  const [expandedSyllabusIdx, setExpandedSyllabusIdx] = useState<number | null>(null);
  const navigate = useNavigate();

  const filteredCourses = courses.filter(c => filter === 'All' || c.language === filter || (filter === 'React' && c.language === 'React'));

  // Reset expanded syllabus when selecting a new course
  const handleSelectCourse = (course: typeof courses[0]) => {
    setSelectedCourse(course);
    setExpandedSyllabusIdx(null);
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Course Catalog</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Explore 15+ languages and hundreds of interactive coding courses.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {['All', 'Python', 'JavaScript', 'C++', 'SQL', 'React'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === f ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-transparent border-gray-700 hover:bg-gray-800'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div onClick={() => handleSelectCourse(course)} className="h-full">
              <Card padding="lg" className="h-full group hover:border-indigo-500/50 transition-colors cursor-pointer flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Code2 size={80} style={{ color: course.color }} />
                </div>

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                    style={{ background: `${course.color}20`, color: course.color }}
                  >
                    <Code2 size={24} />
                  </div>
                  <Badge variant={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'error'}>
                    {course.level}
                  </Badge>
                </div>

                <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-300 transition-colors relative z-10">{course.title}</h3>
                <p className="text-sm mb-6 flex-1 relative z-10" style={{ color: 'var(--color-text-secondary)' }}>
                  {course.description}
                </p>

                <div className="flex flex-col gap-3 pt-4 border-t relative z-10" style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5"><Users size={14}/> {(course.studentsEnrolled / 1000).toFixed(1)}k students</span>
                    <span className="flex items-center gap-1 text-yellow-500 font-medium">
                      <Star size={14} fill="currentColor" /> {course.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs opacity-70">
                    <span className="flex items-center gap-1.5"><Clock size={12}/> {course.duration}</span>
                    <span className="flex items-center gap-1.5"><BookOpen size={12}/> {course.lessons} lessons</span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Course Detail Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedCourse(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div
                className="p-8 flex items-end relative overflow-hidden shrink-0"
                style={{ background: `linear-gradient(135deg, ${selectedCourse.color}15, ${selectedCourse.color}05)` }}
              >
                <div className="absolute -top-12 -right-12 opacity-10">
                  <Code2 size={200} style={{ color: selectedCourse.color }} />
                </div>

                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors text-white/70 hover:text-white z-20"
                >
                  <X size={20} />
                </button>
                <div className="flex items-start gap-6 relative z-10 w-full">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg bg-[var(--color-surface)] border border-white/5 shrink-0"
                    style={{ color: selectedCourse.color }}
                  >
                    <Code2 size={40} />
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2 mb-3">
                      <Badge variant={selectedCourse.level === 'Beginner' ? 'success' : selectedCourse.level === 'Intermediate' ? 'warning' : 'error'}>
                        {selectedCourse.level}
                      </Badge>
                      <Badge variant="default" className="bg-[var(--color-surface-glass)]">
                        {selectedCourse.language}
                      </Badge>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{selectedCourse.title}</h2>
                    <p className="text-[var(--color-text-secondary)] text-sm max-w-xl">
                      {selectedCourse.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto flex-1 grid md:grid-cols-3 gap-8">

                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Award size={18} className="text-indigo-400" />
                      Skills you'll gain
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.skillsGained.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-sm rounded-full border border-indigo-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Course Syllabus</h3>
                    <div className="space-y-3">
                      {selectedCourse.syllabus?.map((topic, idx) => (
                        <div
                          key={idx}
                          onClick={() => setExpandedSyllabusIdx(expandedSyllabusIdx === idx ? null : idx)}
                          className="flex flex-col p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-glass)] hover:border-indigo-500/50 transition-colors cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm font-bold shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{topic.title}</p>
                            </div>
                            <ChevronDown
                              size={18}
                              className={`text-[var(--color-text-muted)] transition-transform duration-300 ${expandedSyllabusIdx === idx ? 'rotate-180' : ''}`}
                            />
                          </div>

                          <AnimatePresence>
                            {expandedSyllabusIdx === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-11 pr-4 pb-2 border-t border-[var(--color-border-subtle)] pt-3">
                                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    {topic.description}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-glass)] space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
                        {selectedCourse.instructor.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Instructor</p>
                        <p className="font-medium text-sm">{selectedCourse.instructor}</p>
                      </div>
                    </div>

                    <div className="border-t border-[var(--color-border-subtle)] pt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)] flex items-center gap-2"><Users size={14}/> Enrolled</span>
                        <span className="font-medium">{selectedCourse.studentsEnrolled.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)] flex items-center gap-2"><Star size={14}/> Rating</span>
                        <span className="font-medium flex items-center gap-1">{selectedCourse.rating} <Star size={12} fill="currentColor" className="text-yellow-500"/></span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)] flex items-center gap-2"><Clock size={14}/> Duration</span>
                        <span className="font-medium">{selectedCourse.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)] flex items-center gap-2"><BookOpen size={14}/> Lessons</span>
                        <span className="font-medium">{selectedCourse.lessons}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)] flex items-center gap-2"><Calendar size={14}/> Updated</span>
                        <span className="font-medium">{selectedCourse.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] flex justify-end gap-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.2)] relative z-10">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-6 py-3 rounded-xl font-medium border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => navigate('/coding')}
                  className="px-8 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <PlayCircle size={20} />
                  Start Learning Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
