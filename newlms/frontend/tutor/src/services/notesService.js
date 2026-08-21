import { courseService } from './courseService';
import { generateId } from '../utils/helpers';

export const notesService = {
  // Get all notes for a course
  getNotes: (courseId) => {
    const course = courseService.getCourseById(courseId);
    return course?.learningContent?.notes || [];
  },

  // Add notes to course
  addNote: (courseId, noteData) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const newNote = {
      ...noteData,
      id: generateId('note')
    };

    if (!course.learningContent) course.learningContent = {};
    if (!course.learningContent.notes) course.learningContent.notes = [];

    course.learningContent.notes.push(newNote);
    courseService.updateCourse(courseId, course);

    courseService.addActivity({
      type: 'note',
      text: `You uploaded notes "${newNote.title}" for "${course.title}"`,
      courseId
    });

    return newNote;
  },

  // Update notes in course
  updateNote: (courseId, noteId, noteData) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const notes = course.learningContent?.notes || [];
    const index = notes.findIndex(n => n.id === noteId);
    if (index === -1) throw new Error('Notes not found');

    const updatedNote = {
      ...notes[index],
      ...noteData
    };

    notes[index] = updatedNote;
    course.learningContent.notes = notes;
    courseService.updateCourse(courseId, course);

    courseService.addActivity({
      type: 'note',
      text: `You updated notes "${updatedNote.title}" for "${course.title}"`,
      courseId
    });

    return updatedNote;
  },

  // Delete notes from course
  deleteNote: (courseId, noteId) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const notes = course.learningContent?.notes || [];
    const note = notes.find(n => n.id === noteId);
    const filtered = notes.filter(n => n.id !== noteId);

    course.learningContent.notes = filtered;
    courseService.updateCourse(courseId, course);

    if (note) {
      courseService.addActivity({
        type: 'note',
        text: `You deleted notes "${note.title}" from "${course.title}"`,
        courseId
      });
    }

    return true;
  }
};
