import React, { useState, useEffect } from 'react';
import { VIDEO_TYPES } from '../../utils/constants';
import { validateVideo } from '../../utils/validators';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const VideoForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'YouTube',
    duration: '',
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
    const validation = validateVideo(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    onSubmit(formData);
  };

  const videoTypeOptions = Object.entries(VIDEO_TYPES).map(([key, label]) => ({
    value: label,
    label: label
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      <Input
        label="Video Title"
        id="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="e.g. React Custom Hooks Setup"
        error={errors.title}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Video Type"
          id="type"
          options={videoTypeOptions}
          value={formData.type}
          onChange={handleChange}
          error={errors.type}
          required
        />
        
        <Input
          label="Video Duration (e.g. 35 mins)"
          id="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="e.g. 25 mins or 1 hr 10 mins"
          error={errors.duration}
        />
      </div>

      <Input
        label="Video URL"
        id="url"
        value={formData.url}
        onChange={handleChange}
        placeholder="e.g. https://www.youtube.com/watch?v=..."
        error={errors.url}
        required
      />

      <div className="flex flex-col w-full gap-1.5">
        <label htmlFor="description" className="text-xs font-semibold text-slate-700">
          Video Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter a brief summary of what this video lecture covers..."
          rows={3}
          className="w-full text-sm py-2.5 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all bg-white"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
        <Button variant="secondary" onClick={onClose} className="text-xs border-slate-200">
          Cancel
        </Button>
        <Button variant="primary" type="submit" className="text-xs bg-brand-600 hover:bg-brand-700">
          Save Video
        </Button>
      </div>
    </form>
  );
};

export default VideoForm;
