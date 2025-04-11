'use client';

import { useState, useMemo } from 'react';
import { VideoCard } from "@/components/ui/video-card";
import { ContentGrid } from "@/components/ui/content-grid";
import { HistoryFilters } from "./HistoryFilters";

interface HistoryItem {
  watchHistory: {
    id: string;
    timestamp: number;
    completed: boolean;
    updatedAt: Date;
  };
  reaction: {
    id: string;
    title: string;
    thumbnail: string;
    first_link?: string;
  };
  series?: {
    id: string;
    title: string;
  };
}

interface HistoryContentProps {
  history: HistoryItem[];
}

export function HistoryContent({ history }: HistoryContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('all');

  // Get unique series list
  const seriesList = useMemo(() => {
    const uniqueSeries = new Set(
      history
        .filter(item => item.series?.title)
        .map(item => item.series!.title)
    );
    return Array.from(uniqueSeries);
  }, [history]);

  // Filter history items
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = item.reaction.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      const matchesSeries = seriesFilter === 'all' || 
        item.series?.title === seriesFilter;

      return matchesSearch && matchesSeries;
    });
  }, [history, searchQuery, seriesFilter]);

  return (
    <>
      <HistoryFilters
        onSearch={setSearchQuery}
        onSeriesFilter={setSeriesFilter}
        seriesList={seriesList}
      />

      <ContentGrid>
        {filteredHistory.map((item) => (
          <VideoCard
            key={item.watchHistory.id}
            id={item.reaction.id}
            title={item.reaction.title}
            subtitle={item.series?.title}
            thumbnail={item.reaction.thumbnail}
            type="reaction"
            primaryLink={`/reactions/${item.reaction.id}`}
            externalLink={item.reaction.first_link}
            progress={item.watchHistory.timestamp}
            duration={24 * 60} // Convert 24 minutes to seconds
            date={item.watchHistory.updatedAt}
            showBadge={true}
            customBadgeText={item.watchHistory.completed ? "Completed" : "Continue Watching"}
            customBadgeColor={item.watchHistory.completed ? "bg-green-600" : "bg-blue-600"}
          />
        ))}
      </ContentGrid>
    </>
  );
}
