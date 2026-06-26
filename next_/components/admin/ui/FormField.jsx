"use client";
import React from 'react';

/**
 * FormField — Reusable labeled form input/select/textarea.
 *
 * Usage:
 *   <FormField label="Product Name" name="name" value={form.name} onChange={handleChange} required error={errors.name} />
 *   <FormField type="select" label="Category" name="categoryId" value={form.categoryId} onChange={handleChange} options={cats} />
 *   <FormField type="textarea" label="Description" name="description" value={form.description} onChange={handleChange} rows={4} />
 */
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options = [],         // for type="select": [{ value, label }]
  rows = 3,             // for type="textarea"
  disabled = false,
  hint,
  accept,               // for type="file"
  multiple = false,     // for type="file"
  maxLength,
  style = {},
  className = '',
}) => {
  const inputStyle = {
    width: '100%',
    padding: '0 12px',
    height: 44,
    minHeight: 44,
    borderWidth: error ? '1.5px' : '1px',
    borderStyle: 'solid',
    borderColor: error ? 'var(--admin-danger)' : 'var(--admin-border)',
    borderRadius: 'var(--admin-radius)',
    fontSize: 14,
    color: 'var(--admin-text)',
    background: disabled ? '#f8fafc' : '#fff',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    cursor: disabled ? 'not-allowed' : 'auto',
    ...style,
  };

  const [isFocused, setIsFocused] = React.useState(false);

  if (isFocused && !error) {
    inputStyle.borderColor = '#6366f1';
    inputStyle.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
  }

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--admin-text-secondary)',
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {label}
          {required && <span style={{ color: 'var(--admin-danger)', marginLeft: 3 }}>*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          name={name}
          multiple={multiple}
          value={value ?? (multiple ? [] : '')}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          required={required}
          className="form-control"
          style={{ 
            ...inputStyle, 
            cursor: disabled ? 'not-allowed' : 'pointer',
            height: multiple ? 'auto' : inputStyle.height,
            padding: multiple ? '8px 12px' : inputStyle.padding
          }}
        >
          {!multiple && <option value="">— Select {label} —</option>}
          {options.map((opt) => (
            <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
              {opt.label ?? opt.name}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value ?? ''}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className="form-control"
          style={{ ...inputStyle, resize: 'vertical', minHeight: `${Math.max(rows * 28, 80)}px` }}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={type === 'file' ? undefined : (value ?? '')}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          accept={accept}
          multiple={multiple}
          maxLength={maxLength}
          className="form-control"
          style={inputStyle}
        />
      )}

      {error && (
        <p style={{ fontSize: 12, color: 'var(--admin-danger)', marginTop: 5, fontWeight: 500 }}>
          <i className="fas fa-exclamation-circle" style={{ marginRight: 4 }}></i>
          {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 5 }}>{hint}</p>
      )}
    </div>
  );
};

export default FormField;
