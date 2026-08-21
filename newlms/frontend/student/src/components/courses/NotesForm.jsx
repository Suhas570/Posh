import React, { useState } from 'react';
import { validateNote } from '../../utils/validators';
import Input from '../common/Input';
import Button from '../common/Button';

const NotesForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateNote(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      <Input
        label="Notes Title"
        id="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="e.g. Session 1: State Management Cheat Sheet"
        error={errors.title}
        required
      />

      <Input
        label="PDF Document URL"
        id="url"
        value={formData.url}
        onChange={handleChange}
        placeholder="e.g. https://www.example.com/notes/react-intro.pdf"
        error={errors.url}
        required
        helperText="Must be a valid link pointing to a PDF document"
      />

      <div className="flex flex-col w-full gap-1.5">
        <label htmlFor="description" className="text-xs font-semibold text-slate-700">
          Notes Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Briefly state what topics or definitions are covered in this lecture notes..."
          rows={3}
          className="w-full text-sm py-2.5 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all bg-white"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
        <Button variant="secondary" onClick={onClose} className="text-xs border-slate-200">
          Cancel
        </Button>
        <Button variant="primary" type="submit" className="text-xs bg-brand-600 hover:bg-brand-700">
          Save Notes
        </Button>
      </div>
    </form>
  );
};

export default NotesForm;
