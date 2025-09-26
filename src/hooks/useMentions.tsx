import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  display_name: string;
  email: string;
}

interface UseMentionsProps {
  onTextChange?: (text: string) => void;
}

export function useMentions({ onTextChange }: UseMentionsProps = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, display_name, email')
          .not('display_name', 'is', null);

        if (error) throw error;

        const formattedUsers = data.map(user => ({
          id: user.user_id,
          display_name: user.display_name || user.email,
          email: user.email
        }));

        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, []);

  const handleTextareaChange = useCallback((text: string, cursorPosition: number) => {
    onTextChange?.(text);

    // Find @ mentions
    const beforeCursor = text.substring(0, cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const searchTerm = beforeCursor.substring(atIndex + 1);
      
      // Only show suggestions if there's no space after @
      if (!searchTerm.includes(' ')) {
        const filtered = users.filter(user =>
          user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(0);
        return;
      }
    }
    
    setShowSuggestions(false);
  }, [users, onTextChange]);

  const handleTextareaKeyDown = useCallback((
    e: React.KeyboardEvent,
    text: string,
    cursorPosition: number,
    setText: (text: string) => void,
    textareaRef?: React.RefObject<HTMLTextAreaElement>
  ) => {
    if (!showSuggestions) return false;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        return true;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return true;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        selectUser(suggestions[selectedIndex], text, cursorPosition, setText, textareaRef);
        return true;
      case 'Escape':
        setShowSuggestions(false);
        return true;
    }
    return false;
  }, [showSuggestions, suggestions, selectedIndex]);

  const selectUser = useCallback((
    user: User,
    text: string,
    cursorPosition: number,
    setText: (text: string) => void,
    textareaRef?: React.RefObject<HTMLTextAreaElement>
  ) => {
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const newText = beforeCursor.substring(0, atIndex) + `@${user.display_name} ` + afterCursor;
      setText(newText);
      setShowSuggestions(false);
      
      // Set cursor position after the mention
      setTimeout(() => {
        if (textareaRef?.current) {
          const newCursorPos = atIndex + user.display_name.length + 2;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 0);
    }
  }, []);

  return {
    suggestions,
    showSuggestions,
    selectedIndex,
    handleTextareaChange,
    handleTextareaKeyDown,
    selectUser,
    setShowSuggestions
  };
}