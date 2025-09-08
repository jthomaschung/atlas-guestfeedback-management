import { useState, useEffect, useMemo } from 'react';
import { CustomerFeedback } from '@/types/feedback';
import { FeedbackFilters } from './FeedbackFilters';

interface SimpleFeedbackFiltersProps {
  feedbacks: CustomerFeedback[];
  onFilter: (filtered: CustomerFeedback[]) => void;
}

export function SimpleFeedbackFilters({ feedbacks, onFilter }: SimpleFeedbackFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [storeFilter, setStoreFilter] = useState<string[]>([]);
  const [marketFilter, setMarketFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Extract unique values for filter options
  const { availableStores, availableMarkets, availableAssignees } = useMemo(() => {
    const stores = [...new Set(feedbacks.map(f => f.store_number))].sort();
    const markets = [...new Set(feedbacks.map(f => f.market))].sort();
    const assignees = [...new Set(feedbacks.map(f => f.assignee).filter(Boolean))].sort();
    
    return {
      availableStores: stores,
      availableMarkets: markets,
      availableAssignees: assignees as string[]
    };
  }, [feedbacks]);

  // Filter feedbacks whenever filters change
  useEffect(() => {
    let filtered = [...feedbacks];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(feedback =>
        feedback.case_number.toLowerCase().includes(term) ||
        feedback.customer_name?.toLowerCase().includes(term) ||
        feedback.feedback_text?.toLowerCase().includes(term) ||
        feedback.complaint_category.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(feedback => statusFilter.includes(feedback.resolution_status));
    }

    // Priority filter
    if (priorityFilter.length > 0) {
      filtered = filtered.filter(feedback => priorityFilter.includes(feedback.priority));
    }

    // Category filter
    if (categoryFilter.length > 0) {
      filtered = filtered.filter(feedback => categoryFilter.includes(feedback.complaint_category));
    }

    // Channel filter
    if (channelFilter.length > 0) {
      filtered = filtered.filter(feedback => channelFilter.includes(feedback.channel));
    }

    // Store filter
    if (storeFilter.length > 0) {
      filtered = filtered.filter(feedback => storeFilter.includes(feedback.store_number));
    }

    // Market filter
    if (marketFilter.length > 0) {
      filtered = filtered.filter(feedback => marketFilter.includes(feedback.market));
    }

    // Assignee filter
    if (assigneeFilter.length > 0) {
      filtered = filtered.filter(feedback => {
        if (assigneeFilter.includes('unassigned')) {
          return !feedback.assignee || feedback.assignee === 'Unassigned';
        }
        return feedback.assignee && assigneeFilter.includes(feedback.assignee);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    onFilter(filtered);
  }, [
    feedbacks, searchTerm, statusFilter, priorityFilter, categoryFilter,
    channelFilter, storeFilter, marketFilter, assigneeFilter, sortOrder, onFilter
  ]);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setPriorityFilter([]);
    setCategoryFilter([]);
    setChannelFilter([]);
    setStoreFilter([]);
    setMarketFilter([]);
    setAssigneeFilter([]);
    setSortOrder('newest');
  };

  return (
    <FeedbackFilters
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      priorityFilter={priorityFilter}
      onPriorityFilterChange={setPriorityFilter}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={setCategoryFilter}
      channelFilter={channelFilter}
      onChannelFilterChange={setChannelFilter}
      storeFilter={storeFilter}
      onStoreFilterChange={setStoreFilter}
      marketFilter={marketFilter}
      onMarketFilterChange={setMarketFilter}
      assigneeFilter={assigneeFilter}
      onAssigneeFilterChange={setAssigneeFilter}
      sortOrder={sortOrder}
      onSortOrderChange={setSortOrder}
      availableStores={availableStores}
      availableMarkets={availableMarkets}
      availableAssignees={availableAssignees}
      onClearAllFilters={handleClearAllFilters}
    />
  );
}