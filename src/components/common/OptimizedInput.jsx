import React, { memo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

const OptimizedInput = memo(({ 
  onDebouncedChange, 
  debounceMs = 300, 
  ...props 
}) => {
  const debouncedCallback = useCallback(
    (value) => {
      if (onDebouncedChange) {
        onDebouncedChange(value);
      }
    },
    [onDebouncedChange]
  );

  const handleChange = (e) => {
    const value = e.target.value;
    if (props.onChange) {
      props.onChange(e);
    }
    debouncedCallback(value);
  };

  return <Input {...props} onChange={handleChange} />;
});

OptimizedInput.displayName = 'OptimizedInput';

export default OptimizedInput;