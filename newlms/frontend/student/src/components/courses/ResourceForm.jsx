import React, { useState } from 'react';
import { RESOURCE_TYPES } from '../../utils/constants';
import { validateResource } from '../../utils/validators';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const ResourceForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'Documentation',
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
    const validation = validateResource(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      <Input
        label="Resource Title"
        id="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="e.g. GitHub - React Hook Form Repository"
        error={errors.title}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Resource Type"
          id="type"
          options={RESOURCE_TYPES}
          value={formData.type}
          onChange={handleChange}
          error={errors.type}
          required
        />
        
        <Input
          label="Resource URL"
          id="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="e.g. https://github.com/react-hook-form..."
          error={errors.url}
          required
        />
      </div>

      <div className="flex flex-col w-full gap-1.5">
        <label htmlFor="description" className="text-xs font-semibold text-slate-700">
          Resource Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Briefly state what references, guidelines, or tools are documented in this link..."
          rows={3}
          className="w-full text-sm py-2.5 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all bg-white"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
        <Button variant="secondary" onClick={onClose} className="text-xs border-slate-200">
          Cancel
        </Button>
        <Button variant="primary" type="submit" className="text-xs bg-brand-600 hover:bg-brand-700">
          Save Resource
        </Button>
      </div>
    </form>
  );
};

export default ResourceForm;
