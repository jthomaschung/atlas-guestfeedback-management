import React, { useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useMentions } from '@/hooks/useMentions';

interface MentionsTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function MentionsTextarea({ 
  value, 
  onChange, 
  className, 
  ...props 
}: MentionsTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const {
    suggestions,
    showSuggestions,
    selectedIndex,
    handleTextareaChange,
    handleTextareaKeyDown,
    selectUser,
    setShowSuggestions
  } = useMentions({
    onTextChange: onChange
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    
    setCursorPosition(newCursorPosition);
    handleTextareaChange(newValue, newCursorPosition);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const handled = handleTextareaKeyDown(
      e,
      value,
      cursorPosition,
      onChange,
      textareaRef
    );
    
    if (!handled && props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setCursorPosition(target.selectionStart);
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        className={className}
        {...props}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((user, index) => (
            <div
              key={user.id}
              className={cn(
                "px-3 py-2 cursor-pointer text-sm",
                "hover:bg-accent hover:text-accent-foreground",
                index === selectedIndex && "bg-accent text-accent-foreground"
              )}
              onClick={() => selectUser(user, value, cursorPosition, onChange, textareaRef)}
            >
              <div className="font-medium">{user.display_name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}