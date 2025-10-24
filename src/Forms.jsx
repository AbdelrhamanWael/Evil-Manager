import React, { useState } from 'react';

function DynamicForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const fieldConfigs = [
    { key: 'firstName', label: 'First Name', component: 'input', type: 'text', rules: { required: true, minLength: 2 }, customValidator: null, options: null },
    { key: 'lastName', label: 'Last Name', component: 'input', type: 'text', rules: { required: true, minLength: 2 }, customValidator: null, options: null },
    { key: 'email', label: 'Email', component: 'input', type: 'email', rules: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }, customValidator: null, options: null },
    { key: 'phone', label: 'Phone Number', component: 'input', type: 'tel', rules: { required: true, pattern: /^\d{10}$/ }, customValidator: null, options: null },
    { key: 'age', label: 'Age', component: 'input', type: 'number', rules: { required: true, min: 18, max: 100 }, customValidator: null, options: null },
    { key: 'address', label: 'Address', component: 'input', type: 'text', rules: { required: true, minLength: 10 }, customValidator: null, options: null },
    { key: 'city', label: 'City', component: 'input', type: 'text', rules: { required: true, minLength: 2 }, customValidator: null, options: null },
    { key: 'state', label: 'State', component: 'select', rules: { required: true }, customValidator: null, options: ['California', 'New York', 'Texas', 'Florida', 'Illinois'] },
    { key: 'zip', label: 'ZIP Code', component: 'input', type: 'text', rules: { required: true, pattern: /^\d{5}$/ }, customValidator: null, options: null },
    { key: 'country', label: 'Country', component: 'input', type: 'text', rules: { required: true, minLength: 2 }, customValidator: null, options: null },
    { key: 'username', label: 'Username', component: 'input', type: 'text', rules: { required: true, minLength: 3, maxLength: 20, pattern: /^[a-zA-Z0-9_]+$/ }, customValidator: null, options: null },
    { key: 'password', label: 'Password', component: 'input', type: 'password', rules: { required: true, minLength: 8 }, customValidator: null, options: null },
    { key: 'confirmPassword', label: 'Confirm Password', component: 'input', type: 'password', rules: { required: true, minLength: 8 }, 
      customValidator: (formData, value) => {
        const password = formData.password;
        if (value && password && value !== password) {
          return 'Passwords do not match';
        }
        return null;
      }, 
      options: null 
    },
    { key: 'dob', label: 'Date of Birth', component: 'input', type: 'date', rules: { required: true }, 
      customValidator: (formData, value) => {
        if (!value) return null;
        const birthDate = new Date(value + 'T00:00:00');
        if (isNaN(birthDate.getTime())) return 'Invalid date';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) return 'Must be at least 18 years old';
        return null;
      }, 
      options: null 
    },
    { key: 'gender', label: 'Gender', component: 'select', rules: { required: true }, customValidator: null, options: ['Male', 'Female', 'Other'] },
    { key: 'subscribe', label: 'Subscribe to Newsletter', component: 'checkbox', rules: { required: false }, customValidator: null, options: null },
    { key: 'comments', label: 'Comments', component: 'textarea', type: 'text', rules: { required: false, maxLength: 500 }, customValidator: null, options: null },
    { key: 'emergencyContact', label: 'Emergency Contact Phone', component: 'input', type: 'tel', rules: { required: true, pattern: /^\d{10}$/ }, customValidator: null, options: null },
    { key: 'relation', label: 'Relation to Emergency Contact', component: 'input', type: 'text', rules: { required: true, minLength: 2 }, customValidator: null, options: null },
    { key: 'salary', label: 'Expected Salary', component: 'input', type: 'number', rules: { required: false, min: 0, max: 1000000 }, customValidator: null, options: null },
  ];

  const validateField = (config, value, formData) => {
    let error = '';

    // Required check
    if (config.rules.required) {
      let isEmpty = (value === '' || value === null || value === undefined);
      if (!isEmpty) {
        if (typeof value === 'string') {
          isEmpty = value.trim() === '';
        } else if (typeof value === 'number') {
          isEmpty = isNaN(value);
        } else if (typeof value === 'boolean') {
          isEmpty = !value;
        }
      }
      if (isEmpty) {
        return `${config.label} is required`;
      }
    }

    // String-based checks (length, pattern)
    if (typeof value === 'string' && value.trim() !== '') {
      const trimmed = value.trim();
      if (config.rules.minLength && trimmed.length < config.rules.minLength) {
        return `Must be at least ${config.rules.minLength} characters`;
      }
      if (config.rules.maxLength && trimmed.length > config.rules.maxLength) {
        return `Must be at most ${config.rules.maxLength} characters`;
      }
      if (config.rules.pattern && !config.rules.pattern.test(trimmed)) {
        return `Invalid format for ${config.label}`;
      }
    }

    // Number-based checks
    if (typeof value === 'number' && !isNaN(value)) {
      if (config.rules.min !== undefined && value < config.rules.min) {
        return `Must be at least ${config.rules.min}`;
      }
      if (config.rules.max !== undefined && value > config.rules.max) {
        return `Must be at most ${config.rules.max}`;
      }
    }

    // Custom validator
    if (config.customValidator) {
      const customError = config.customValidator(formData, value);
      if (customError) {
        return customError;
      }
    }

    return '';
  };

  const handleChange = (config, e) => {
    let val;
    if (config.component === 'checkbox') {
      val = e.target.checked;
    } else if (config.type === 'number') {
      const num = e.target.valueAsNumber;
      val = isNaN(num) ? '' : num;
    } else {
      val = e.target.value;
    }

    const newFormData = { ...formData, [config.key]: val };
    setFormData(newFormData);

    // Re-validate all fields for dependencies (e.g., confirmPassword)
    const newErrors = {};
    fieldConfigs.forEach((c) => {
      newErrors[c.key] = validateField(c, newFormData[c.key], newFormData);
    });
    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    let hasError = false;
    fieldConfigs.forEach((config) => {
      const err = validateField(config, formData[config.key], formData);
      newErrors[config.key] = err;
      if (err) hasError = true;
    });
    setErrors(newErrors);
    if (!hasError) {
      console.log('Form submitted successfully:', formData);
      // Here you could send the data to a server, etc.
    }
  };

  const renderField = (config) => {
    const value = formData[config.key] ?? (config.component === 'checkbox' ? false : '');
    const error = errors[config.key] || '';

    const commonProps = {
      id: config.key,
      value: value,
      onChange: (e) => handleChange(config, e),
      'aria-invalid': !!error,
    };

    const requiredMark = config.rules.required ? <span className="text-red-500">*</span> : null;

    if (config.component === 'input') {
      return (
        <div key={config.key} className="mb-4">
          <label htmlFor={config.key} className="block text-sm font-medium text-gray-700 mb-1">
            {config.label} {requiredMark}
          </label>
          <input
            {...commonProps}
            type={config.type}
            required={config.rules.required}
            min={config.rules.min}
            max={config.rules.max}
            pattern={config.rules.pattern ? config.rules.pattern.source : undefined}
            className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
        </div>
      );
    } else if (config.component === 'select') {
      return (
        <div key={config.key} className="mb-4">
          <label htmlFor={config.key} className="block text-sm font-medium text-gray-700 mb-1">
            {config.label} {requiredMark}
          </label>
          <select {...commonProps} required={config.rules.required} className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}>
            <option value="">Select {config.label.toLowerCase()}...</option>
            {config.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
        </div>
      );
    } else if (config.component === 'textarea') {
      return (
        <div key={config.key} className="mb-4">
          <label htmlFor={config.key} className="block text-sm font-medium text-gray-700 mb-1">
            {config.label} {requiredMark}
          </label>
          <textarea
            {...commonProps}
            rows={4}
            required={config.rules.required}
            className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
        </div>
      );
    } else if (config.component === 'checkbox') {
      return (
        <div key={config.key} className="mb-4 flex items-center">
          <input
            {...commonProps}
            type="checkbox"
            checked={value}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={config.key} className="ml-2 block text-sm text-gray-900">
            {config.label}
          </label>
          {error && <span className="text-red-500 text-sm ml-2">{error}</span>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <form onSubmit={handleSubmit} className="max-w-2xl w-full bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Dynamic Form</h2>
        {fieldConfigs.map(renderField)}
        <button type="submit" className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200">Submit Form</button>
      </form>
    </div>
  );
}

export default DynamicForm;
