// Simple validators for the frontend forms

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const validateCourse = (data) => {
  const errors = {};
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Course Title is required';
  }
  if (!data.description || data.description.trim() === '') {
    errors.description = 'Description is required';
  }
  if (!data.category || data.category.trim() === '') {
    errors.category = 'Category is required';
  }
  if (!data.instructor || data.instructor.trim() === '') {
    errors.instructor = 'Instructor is required';
  }
  if (!data.duration || data.duration.trim() === '') {
    errors.duration = 'Duration is required';
  }
  if (!data.level) {
    errors.level = 'Level is required';
  }
  if (!data.language) {
    errors.language = 'Language is required';
  }
  if (!data.status) {
    errors.status = 'Status is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateVideo = (data) => {
  const errors = {};
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Video title is required';
  }
  if (!data.url || data.url.trim() === '') {
    errors.url = 'Video URL is required';
  } else if (!isValidUrl(data.url)) {
    errors.url = 'Must be a valid URL';
  }
  if (!data.type) {
    errors.type = 'Video type is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateNote = (data) => {
  const errors = {};
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Notes title is required';
  }
  if (!data.url || data.url.trim() === '') {
    errors.url = 'PDF URL is required';
  } else if (!isValidUrl(data.url)) {
    errors.url = 'Must be a valid URL';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePPT = (data) => {
  const errors = {};
  if (!data.title || data.title.trim() === '') {
    errors.title = 'PPT title is required';
  }
  if (!data.url || data.url.trim() === '') {
    errors.url = 'PPT URL is required';
  } else if (!isValidUrl(data.url)) {
    errors.url = 'Must be a valid URL';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateResource = (data) => {
  const errors = {};
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Resource title is required';
  }
  if (!data.url || data.url.trim() === '') {
    errors.url = 'Resource URL is required';
  } else if (!isValidUrl(data.url)) {
    errors.url = 'Must be a valid URL';
  }
  if (!data.type) {
    errors.type = 'Resource type is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
