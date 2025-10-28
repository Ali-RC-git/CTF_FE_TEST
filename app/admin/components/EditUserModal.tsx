'use client';

import { useState, useEffect } from 'react';
import { AdminUser } from '@/lib/api';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import PasswordInput from '@/components/ui/PasswordInput';
import PasswordValidator from '@/components/auth/PasswordValidator';
import ModalCloseButton from '@/components/ui/ModalCloseButton';
import ConfirmationModal from './ConfirmationModal';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, userData: any) => void;
  user: AdminUser | null;
}

export default function EditUserModal({ isOpen, onClose, onSave, user }: EditUserModalProps) {
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
    department: ''
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, setErrors, clearErrors, clearFieldError, handleApiError, getFieldError } = useFormValidation();


  useEffect(() => {
    if (isOpen && user) {
      setHasChanges(false);
      clearErrors();
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        password: '', // Leave empty for security
        password_confirm: '', // Leave empty for security
        role: user.role,
        status: user.status,
        institution: user.profile?.institution || '',
        department: user.profile?.department || ''
      });
    }
  }, [isOpen, user, clearErrors]);

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
    console.log('EditUserModal - handleSubmit called');
    
    // Clear previous errors
    clearErrors();
    
    // Client-side validation
    console.log('EditUserModal - Starting validation');
    const clientErrors: { [key: string]: string[] } = {};
    
    if (formData.password && formData.password !== formData.password_confirm) {
      console.log('EditUserModal - Password mismatch error');
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
      console.log('EditUserModal - Validation errors found:', clientErrors);
      setErrors(clientErrors);
      return;
    }
    
    console.log('EditUserModal - Validation passed, proceeding with submission');
    
    if (user) {
      console.log('EditUserModal - About to set isSubmitting to true');
      setIsSubmitting(true);
      try {
        console.log('EditUserModal - formData being sent:', formData);
        console.log('EditUserModal - About to call onSave with userId:', user.id);
        await onSave(user.id, formData);
        console.log('EditUserModal - onSave completed successfully');
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsSubmitting(false);
      }
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

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl w-full max-w-2xl border border-border-color shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-card-bg">
          <h3 className="text-xl font-semibold text-accent-light">Edit User</h3>
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
            <PasswordInput
              label="New Password (Optional)"
              placeholder="Enter new password"
              error={getFieldError('password') || undefined}
              autoComplete="new-password"
            />
            
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              error={getFieldError('password_confirm') || undefined}
              autoComplete="new-password"
            />
             {/* Dynamic password validation */}
            <PasswordValidator 
              password={formData.password} 
              showValidation={true}
              className="md:col-span-2"
            />
            
          </div>
          
          
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
                    Institution
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
                    Department
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

          
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update User'}
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
