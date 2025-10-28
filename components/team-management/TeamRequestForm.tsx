import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface TeamRequestFormProps {
  teamName: string;
  onSubmit: (data: { message: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  message: string;
}

export const TeamRequestForm: React.FC<TeamRequestFormProps> = ({
  teamName,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      message: ''
    }
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Request to Join Team</h2>
        <p className="text-sm text-text-secondary mt-1">
          Send a request to join <span className="font-medium">{teamName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1">
            Message (Optional)
          </label>
          <textarea
            id="message"
            {...register('message', {
              maxLength: {
                value: 500,
                message: 'Message must be less than 500 characters'
              }
            })}
            rows={4}
            className="w-full px-3 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-accent-color"
            placeholder="Tell the team leader why you'd like to join..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
          )}
          <p className="mt-1 text-xs text-text-secondary">
            This message will be sent to the team leader along with your request.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-text-primary bg-secondary-bg border border-border-color rounded-lg hover:bg-primary-bg focus:outline-none focus:ring-2 focus:ring-accent-color disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-accent-color border border-transparent rounded-lg hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-color disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </form>
    </div>
  );
};
