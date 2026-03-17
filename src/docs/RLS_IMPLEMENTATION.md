# Row-Level Security (RLS) Implementation

## Overview

Scholr implements comprehensive Row-Level Security (RLS) to ensure users can only access data from their assigned school. This document outlines the architecture and usage of the RLS system.

## Architecture

### Core Components

1. **lib/rls.js** - Core RLS utilities
   - `getUserSchoolId()` - Get user's active school
   - `verifySchoolAccess(schoolId)` - Check if user can access a school
   - `verifyRecordAccess(record, schoolIdField)` - Check if user can access a record
   - `applyRLS(records, entityName, schoolIdField)` - Filter records for user's school
   - `buildRLSFilter(additionalFilters)` - Build RLS-compliant query filters

2. **lib/error-tracking.js** - Error tracking and reporting
   - `logError(errorData)` - Log errors to ErrorLog entity
   - `withErrorTracking(fn, context)` - Wrap functions with error tracking
   - `reportRLSViolation(details)` - Report RLS violations
   - `reportUnauthorizedAccess(resource, userId, schoolId)` - Report unauthorized access

3. **hooks/useRLS.js** - React hooks for RLS enforcement
   - `useUserSchoolId()` - Get user's school in components
   - `useSchoolAccess(schoolId)` - Verify school access in components
   - `useRecordAccess(record, schoolIdField)` - Verify record access in components
   - `useRLSFilter(additionalFilters)` - Build RLS filters in components

4. **components/security/RLSProvider.jsx** - Context provider for RLS
   - Provides RLS functions to all components
   - Handles error reporting automatically

5. **Backend Functions**
   - `secureQuery.js` - Execute queries with RLS enforcement
   - `verifyRecordAccess.js` - Verify record access on backend

## Usage Patterns

### In React Components

#### Get User's School
```jsx
import { useUserSchoolId } from '@/hooks/useRLS';

export default function MyComponent() {
  const { schoolId, loading, error } = useUserSchoolId();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>School ID: {schoolId}</div>;
}
```

#### Verify School Access
```jsx
import { useSchoolAccess } from '@/hooks/useRLS';

export default function SchoolPage({ schoolId }) {
  const { hasAccess, loading, error } = useSchoolAccess(schoolId);
  
  if (loading) return <div>Checking access...</div>;
  if (!hasAccess) return <div>Access Denied</div>;
  
  return <div>School Content</div>;
}
```

#### Verify Record Access
```jsx
import { useRecordAccess } from '@/hooks/useRLS';

export default function RecordDetail({ record }) {
  const { hasAccess, loading, error } = useRecordAccess(record);
  
  if (loading) return <div>Checking access...</div>;
  if (!hasAccess) return <div>Access Denied</div>;
  
  return <div>{record.name}</div>;
}
```

#### Build RLS Filters
```jsx
import { useRLSFilter } from '@/hooks/useRLS';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ClassList() {
  const { filter, loading, error } = useRLSFilter({ status: 'active' });
  
  const { data: classes } = useQuery({
    queryKey: ['classes', filter],
    queryFn: () => base44.entities.Class.filter(filter),
    enabled: !!filter
  });
  
  return <div>{/* Render classes */}</div>;
}
```

### In Backend Functions

#### Using secureQuery Function
```javascript
// Frontend
const response = await base44.functions.invoke('secureQuery', {
  entity: 'Class',
  filters: { status: 'active' },
  sort: '-created_date',
  limit: 20
});

const classes = response.data;
```

#### Verify Record Access Before Operations
```javascript
// Backend
const response = await base44.functions.invoke('verifyRecordAccess', {
  entity: 'Class',
  recordId: classId,
  schoolIdField: 'school_id'
});

if (!response.data.hasAccess) {
  return Response.json({ error: 'Access denied' }, { status: 403 });
}

// Proceed with operation
```

### Direct Usage of RLS Utilities

```javascript
import { buildRLSFilter, verifyRecordAccess } from '@/lib/rls';
import { logError, reportRLSViolation } from '@/lib/error-tracking';

// Get RLS-compliant filter
const filter = await buildRLSFilter({ status: 'active' });

// Check record access
const hasAccess = await verifyRecordAccess(record);
if (!hasAccess) {
  await reportRLSViolation({ recordId: record.id });
}

// Log errors
await logError({
  message: 'Something went wrong',
  code: 'MY_ERROR',
  severity: 'error'
});
```

## Super Admin Bypass

Super admins can access any school's data without RLS restrictions:

```javascript
const user = await base44.auth.me();
if (user.role === 'super_admin') {
  // No RLS filter applied - can access all records
}
```

## Error Tracking

All RLS operations and errors are automatically logged to the `ErrorLog` entity. This includes:

- Access verification failures
- RLS violations (unauthorized access attempts)
- Filter building errors
- Record access errors

### Error Log Fields

- `message`: Human-readable error message
- `code`: Machine-readable error code (e.g., 'RLS_VIOLATION', 'NO_SCHOOL_MEMBERSHIP')
- `context`: JSON context about the error
- `severity`: info, warning, error, critical
- `user_id`: User who caused the error
- `school_id`: School context
- `stack_trace`: JavaScript stack trace
- `timestamp`: When the error occurred
- `user_agent`: Browser information

## Best Practices

1. **Always use RLS utilities for queries**
   - Use `useRLSFilter()` in components
   - Use `secureQuery()` function for backend queries
   - Never query without school_id filter (unless super admin)

2. **Verify access before operations**
   - Use `useRecordAccess()` before displaying records
   - Use `verifyRecordAccess()` function before backend operations
   - Always check the response before proceeding

3. **Handle errors gracefully**
   - Catch RLS-related errors
   - Display appropriate user messages
   - Errors are automatically logged for debugging

4. **Log security events**
   - Use `reportRLSViolation()` for suspicious activity
   - Use `reportUnauthorizedAccess()` for access denial
   - Errors help identify security threats

## Testing RLS

To test RLS enforcement:

1. Create test users in different schools
2. Try accessing records from another school
3. Verify error logs show RLS_VIOLATION entries
4. Confirm access is denied with 403 status

## Migration Guide

When adding RLS to existing code:

1. Replace direct `base44.entities.X.filter()` with RLS-aware queries
2. Add `useRecordAccess()` hook before rendering sensitive data
3. Update backend functions to use `secureQuery()`
4. Add error tracking to all user-facing operations

## Troubleshooting

### "User has no school membership"
- Ensure user has active SchoolMembership record
- Check membership status is "active"

### "Access denied"
- Verify record's school_id matches user's school
- Check if user is actually assigned to that school

### RLS violations in logs
- Review ErrorLog for attempted access details
- Investigate if access should be granted
- Contact user if suspicious activity detected