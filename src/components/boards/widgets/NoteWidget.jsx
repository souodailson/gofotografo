import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/useDebounce';

const NOTE_PLACEHOLDER = 'Nova anotação...';

const NoteWidget = ({ content, onContentChange, autoFocus = false }) => {
  const [text, setText] = useState(content?.text || '');
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(!content?.text);
  const debouncedText = useDebounce(text, 500);
  const isInitialMount = useRef(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      // If it has the placeholder text, select it all so typing overwrites it.
      if (isPlaceholderVisible) {
        textareaRef.current.select();
      }
    }
  }, [autoFocus, isPlaceholderVisible]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Don't save placeholder text
    const textToSave = isPlaceholderVisible ? '' : debouncedText;
    onContentChange({ text: textToSave }, true);
  }, [debouncedText, onContentChange, isPlaceholderVisible]);

  const handleFocus = () => {
    if (isPlaceholderVisible) {
      setText('');
      setIsPlaceholderVisible(false);
    }
  };

  const handleBlur = () => {
    if (!text) {
      setIsPlaceholderVisible(true);
    }
  };
  
  const displayText = isPlaceholderVisible ? NOTE_PLACEHOLDER : text;

  return (
    <Textarea
      ref={textareaRef}
      value={displayText}
      onChange={(e) => setText(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={NOTE_PLACEHOLDER}
      className={`w-full h-full resize-none border-none focus:ring-0 bg-transparent text-sm p-3 ${isPlaceholderVisible ? 'text-muted-foreground' : ''}`}
    />
  );
};

export default NoteWidget;