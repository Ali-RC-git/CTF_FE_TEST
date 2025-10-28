# Centralized Error Handling System

This document explains the centralized error handling system implemented for handling backend validation errors and other API errors in the CTF application.

## Overview

The error handling system provides a unified way to process, display, and manage errors from the backend API, with special focus on validation errors that contain field-specific error messages.

## Key Components

### 1. Error Handler Utility (`lib/utils/error-handler.ts`)

The core utility that processes backend errors and transforms them into a structured format.

#### Key Functions:

- **`processBackendError(error)`**: Main function that processes any error and returns structured error information
- **`getFieldError(fieldErrors, fieldName)`**: Gets the first error message for a specific field
- **`getFieldErrors(fieldErrors, fieldName)`**: Gets all error messages for a specific field
- **`hasFieldError(fieldErrors, fieldName)`**: Checks if a field has errors
- **`getErrorType(error)`**: Determines the type of error (validation, network, server, etc.)

#### Error Types:

```typescript
enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}
```

### 2. Form Errors Hook (`lib/hooks/useFormErrors.ts`)

A custom React hook that provides a convenient interface for managing form errors.

#### Usage:

```typescript
const { setError, clearErrors, getFieldError, getGeneralError } = useFormErrors();
```

#### Methods:

- **`setError(error)`**: Sets an error (APIError, Error, or string)
- **`clearErrors()`**: Clears all errors
- **`getFieldError(fieldName)`**: Gets error message for a specific field
- **`hasFieldError(fieldName)`**: Checks if a field has errors
- **`getGeneralError()`**: Gets the general error message

### 3. Enhanced API Error Class (`lib/api/client.ts`)

The `APIError` class has been enhanced to include processed error information.

#### New Methods:

- **`getFieldErrors()`**: Returns array of field errors
- **`getFieldError(fieldName)`**: Gets error for specific field
- **`hasFieldError(fieldName)`**: Checks if field has errors
- **`getGeneralError()`**: Gets general error message
- **`isValidationError()`**: Checks if this is a validation error

## Backend Error Format Support

The system handles the exact error format you specified:

```json
{
    "email": [
        "User with this email already exists."
    ],
    "username": [
        "User with this username already exists."
    ],
    "password": [
        "This password is too common.",
        "This password is entirely numeric."
    ]
}
```

## Usage Examples

### 1. Basic Form with Error Handling

```typescript
import { useFormErrors } from '@/lib/hooks/useFormErrors';
import { APIError } from '@/lib/api';

export default function MyForm() {
  const { setError, clearErrors, getFieldError, getGeneralError } = useFormErrors();
  
  const onSubmit = async (data) => {
    clearErrors();
    try {
      await apiCall(data);
    } catch (error) {
      setError(error); // Handles APIError, Error, or string
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* General Error Display */}
      {getGeneralError() && (
        <div className="error-message">
          {getGeneralError()}
        </div>
      )}
      
      {/* Form Fields with Field-Specific Errors */}
      <Input
        {...register("email")}
        error={errors.email?.message || getFieldError("email")}
      />
      
      <Input
        {...register("username")}
        error={errors.username?.message || getFieldError("username")}
      />
    </form>
  );
}
```

### 2. Handling Different Error Types

```typescript
const handleError = (error) => {
  if (error instanceof APIError) {
    if (error.isValidationError()) {
      // Handle validation errors - field-specific errors are automatically processed
      console.log('Field errors:', error.getFieldErrors());
    } else {
      // Handle other API errors
      console.log('General error:', error.getGeneralError());
    }
  } else {
    // Handle generic errors
    console.log('Generic error:', error.message);
  }
};
```

### 3. Custom Error Message Formatting

The system automatically formats common error messages:

- `"User with this email already exists."` → `"An account with this email address already exists."`
- `"This password is too common."` → `"This password is too common. Please choose a stronger password."`
- `"This password is entirely numeric."` → `"Password cannot be entirely numeric."`

## Error Message Formatting

The system provides user-friendly error messages by:

1. **Field Name Mapping**: Converts backend field names to user-friendly labels
   - `first_name` → `First name`
   - `password_confirm` → `Confirm password`

2. **Message Enhancement**: Improves error messages for better UX
   - Adds context to generic messages
   - Provides actionable feedback
   - Maintains consistency across the application

## Integration with Forms

### React Hook Form Integration

The system seamlessly integrates with `react-hook-form`:

```typescript
// Client-side validation errors (from Zod)
error={errors.email?.message}

// Server-side validation errors (from backend)
error={getFieldError("email")}

// Combined (shows both types)
error={errors.email?.message || getFieldError("email")}
```

### Form Components Updated

The following components have been updated to use the new error handling:

- **SignUpForm**: Handles registration validation errors
- **LoginForm**: Handles login validation errors  
- **CreateTeamModal**: Handles team creation validation errors

## Error Display Patterns

### 1. General Error Display

```typescript
{(error || getGeneralError()) && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
    {error || getGeneralError()}
  </div>
)}
```

### 2. Field-Specific Error Display

```typescript
<Input
  {...register("fieldName")}
  error={errors.fieldName?.message || getFieldError("fieldName")}
/>
```

### 3. Multiple Error Messages

```typescript
{formErrors.fieldErrors.map((fieldError, index) => (
  <div key={index}>
    <strong>{fieldError.field}:</strong> {fieldError.messages.join(', ')}
  </div>
))}
```

## Testing

### Example Component

See `components/examples/ErrorHandlingExample.tsx` for a complete example demonstrating:

- Different error types (validation, network, server)
- Field-specific error display
- General error display
- Error state management

### Test Scenarios

The system handles these error scenarios:

1. **Validation Errors**: Field-specific errors with multiple messages per field
2. **Network Errors**: Connection issues and timeouts
3. **Authentication Errors**: Invalid credentials, expired tokens
4. **Authorization Errors**: Insufficient permissions
5. **Server Errors**: Internal server errors (500, 502, 503)
6. **Not Found Errors**: Resource not found (404)

## Benefits

### 1. **Centralized Processing**
- All error handling logic in one place
- Consistent error processing across the application
- Easy to maintain and update

### 2. **User-Friendly Messages**
- Automatic formatting of backend error messages
- Field name mapping for better UX
- Contextual error messages

### 3. **Developer Experience**
- Simple API for handling errors
- Type-safe error handling
- Comprehensive error information

### 4. **Flexible Integration**
- Works with any form library
- Supports both client-side and server-side validation
- Handles multiple error types

### 5. **Error Resilience**
- Graceful handling of unexpected error formats
- Fallback error messages
- Comprehensive error logging

## Best Practices

### 1. **Always Clear Errors**
```typescript
const onSubmit = async (data) => {
  clearErrors(); // Clear previous errors
  try {
    await apiCall(data);
  } catch (error) {
    setError(error);
  }
};
```

### 2. **Combine Client and Server Validation**
```typescript
error={errors.fieldName?.message || getFieldError("fieldName")}
```

### 3. **Handle Different Error Types**
```typescript
if (error instanceof APIError) {
  if (error.isValidationError()) {
    // Handle validation errors
  } else {
    // Handle other API errors
  }
}
```

### 4. **Provide User Feedback**
```typescript
// Show loading state during API calls
<Button disabled={isLoading}>
  {isLoading ? 'Submitting...' : 'Submit'}
</Button>
```

## Migration Guide

### From Old Error Handling

**Before:**
```typescript
const [formError, setFormError] = useState<string | null>(null);

try {
  await apiCall(data);
} catch (error) {
  if (error instanceof APIError) {
    setFormError(error.message);
  } else {
    setFormError('An error occurred');
  }
}
```

**After:**
```typescript
const { setError, clearErrors, getFieldError, getGeneralError } = useFormErrors();

try {
  await apiCall(data);
} catch (error) {
  setError(error); // Handles all error types automatically
}
```

### Form Field Updates

**Before:**
```typescript
<Input
  {...register("email")}
  error={errors.email?.message}
/>
```

**After:**
```typescript
<Input
  {...register("email")}
  error={errors.email?.message || getFieldError("email")}
/>
```

This centralized error handling system provides a robust, user-friendly, and maintainable solution for handling backend validation errors and other API errors throughout the application.
