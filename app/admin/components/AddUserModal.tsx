'use client';

import { useState, useEffect } from 'react';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { Input } from '@/components/ui/Input';
import PasswordValidator from '@/components/auth/PasswordValidator';
import ModalCloseButton from '@/components/ui/ModalCloseButton';
import ConfirmationModal from './ConfirmationModal';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
}

export default function AddUserModal({ isOpen, onClose, onSave }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    role: 'user',
    status: 'active',
    institution: '',
    department: '',
    sendWelcomeEmail: true
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, setErrors, clearErrors, clearFieldError, handleApiError, getFieldError } = useFormValidation();


  useEffect(() => {
    if (isOpen) {
      setHasChanges(false);
      clearErrors();
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            username: '',
            password: '',
            password_confirm: '',
            role: 'user',
            status: 'active',
            institution: '',
            department: '',
            sendWelcomeEmail: true
          });
    }
  }, [isOpen, clearErrors]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (hasChanges) {
          if (confirm('Do you want to discard the changes?')) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, hasChanges, onClose]);

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
    clearFieldError(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Client-side validation
    const clientErrors: { [key: string]: string[] } = {};
    
    if (formData.password !== formData.password_confirm) {
      clientErrors.password_confirm = ['Passwords do not match. Please make sure both password fields are identical.'];
    }
    
    // Password validation is now handled by PasswordValidator component
    
    if (!formData.first_name.trim()) {
      clientErrors.first_name = ['First name is required.'];
    }
    
    if (!formData.last_name.trim()) {
      clientErrors.last_name = ['Last name is required.'];
    }
    
    if (!formData.email.trim()) {
      clientErrors.email = ['Email address is required.'];
    }
    
    if (!formData.username.trim()) {
      clientErrors.username = ['Username is required.'];
    }
    
    
    // If there are client-side validation errors, show them and stop
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    
        setIsSubmitting(true);
        try {
          await onSave(formData);
        } catch (error) {
          handleApiError(error);
        } finally {
          setIsSubmitting(false);
        }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl w-full max-w-2xl border border-border-color shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-card-bg">
          <h3 className="text-xl font-semibold text-accent-light">Add New User</h3>
          <ModalCloseButton onClick={handleClose} />
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {getFieldError('general') && (
            <div className="bg-danger-color/20 border border-danger-color text-danger-color px-4 py-3 rounded-lg flex items-center">
              <span className="mr-2">⚠️</span>
              {getFieldError('general')}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
                className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${
                  getFieldError('first_name') 
                    ? 'border-danger-color focus:ring-danger-color' 
                    : 'border-border-color focus:ring-accent-color'
                }`}
                required
              />
              {getFieldError('first_name') && (
                <p className="text-danger-color text-sm mt-1">{getFieldError('first_name')}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
                className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${
                  getFieldError('last_name') 
                    ? 'border-danger-color focus:ring-danger-color' 
                    : 'border-border-color focus:ring-accent-color'
                }`}
                required
              />
              {getFieldError('last_name') && (
                <p className="text-danger-color text-sm mt-1">{getFieldError('last_name')}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${
                getFieldError('email') 
                  ? 'border-danger-color focus:ring-danger-color' 
                  : 'border-border-color focus:ring-accent-color'
              }`}
              required
            />
            {getFieldError('email') && (
              <p className="text-danger-color text-sm mt-1">{getFieldError('email')}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${
                getFieldError('username') 
                  ? 'border-danger-color focus:ring-danger-color' 
                  : 'border-border-color focus:ring-accent-color'
              }`}
              required
            />
            {getFieldError('username') && (
              <p className="text-danger-color text-sm mt-1">{getFieldError('username')}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
              placeholder="Enter password"
              error={getFieldError('password') || undefined}
              required
              autoComplete="new-password"
            />
            
           
            
            <Input
              label="Confirm Password"
              type="password"
              value={formData.password_confirm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password_confirm', e.target.value)}
              placeholder="Confirm password"
              error={getFieldError('password_confirm') || undefined}
              required
              autoComplete="new-password"
            />
          </div>
           {/* Dynamic password validation */}
            <PasswordValidator 
              password={formData.password} 
              showValidation={true}
              className="md:col-span-2"
            />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="user">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Institution (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    placeholder="Enter institution"
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Department (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Enter department"
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                  />
                </div>
              </div>


          
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.sendWelcomeEmail}
                onChange={(e) => handleInputChange('sendWelcomeEmail', e.target.checked)}
                className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
              />
              <span className="text-text-secondary">Send account details to user via email</span>
            </label>
          </div>
          
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmClose}
        title="Discard Changes"
        message="Are you sure you want to discard the changes? This action cannot be undone."
        confirmText="Discard"
        cancelText="Keep Editing"
        type="warning"
      />
    </div>
  );
}
