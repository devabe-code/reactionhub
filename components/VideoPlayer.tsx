'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { Session } from 'next-auth';

interface VideoPlayerProps {
  src: string | null;
  poster?: string;
  className?: string;
  reactionId: string;
  startTime?: number;
  session? : Session;
}

export default function VideoPlayer({ 
  src, 
  poster, 
  className, 
  reactionId,
  startTime = 0,
  session
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [initialProgressLoaded, setInitialProgressLoaded] = useState(false);
  const progressTrackingInitialized = useRef(false);

  const startProgressInterval = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    progressInterval.current = setInterval(() => {
      if (videoRef.current?.currentTime! > 0) {
        console.log('Saving progress from interval:', videoRef.current?.currentTime!);
        saveProgress(videoRef.current?.currentTime!);
      }
    }, 5000);
  };

  // Initialize video element and handle ready state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoReady = () => {
      console.log('Video is ready to play');
      setIsVideoReady(true);
      
      // Set initial playback position if specified and no saved progress
      if (startTime > 0 && !video.currentTime) {
        console.log('Setting initial playback position:', startTime);
        video.currentTime = startTime;
      }
    };

    // Add multiple event listeners to ensure we catch the ready state
    video.addEventListener('loadedmetadata', handleVideoReady);
    video.addEventListener('canplay', handleVideoReady);
    video.addEventListener('loadeddata', handleVideoReady);

    return () => {
      video.removeEventListener('loadedmetadata', handleVideoReady);
      video.removeEventListener('canplay', handleVideoReady);
      video.removeEventListener('loadeddata', handleVideoReady);
    };
  }, [startTime, src]);

  const initializeProgressTracking = () => {
    if (!isVideoReady || !initialProgressLoaded || !session?.user?.id || !reactionId) {
      console.log('Cannot initialize progress tracking - prerequisites not met', {
        isVideoReady,
        initialProgressLoaded,
        hasSession: !!session?.user?.id,
        reactionId
      });
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (!progressTrackingInitialized.current) {
      console.log('Initializing progress tracking');
      progressTrackingInitialized.current = true;

      // Add event listeners
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('seeking', handleSeeking);
      video.addEventListener('play', handlePlay);

      // Start progress interval
      startProgressInterval();

      // Save initial progress if video has been played
      if (video.currentTime > 0) {
        console.log('Saving initial progress:', video.currentTime);
        saveProgress(video.currentTime);
      }
    }
  };

  const handlePlay = () => {
    console.log('Video started playing');
    setIsPlaying(true);
    startProgressInterval();
  };

  const handlePause = () => {
    console.log('Pause event triggered');
    setIsPlaying(false);
    if (videoRef.current?.currentTime! > 0) {
      console.log('Saving progress on pause:', videoRef.current?.currentTime!);
      saveProgress(videoRef.current?.currentTime!);
    }
  };

  const handleSeeking = () => {
    const currentTime = videoRef.current?.currentTime;
    if (currentTime) {
      console.log('Seeking event triggered, saving progress:', currentTime);
      saveProgress(currentTime);
    }
  };

  const handleEnded = () => {
    console.log('Video ended event triggered');
    setIsPlaying(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (videoRef.current) {
      saveProgress(videoRef.current.duration, true);
    }
  };

  const handleVideoClick = () => {
    console.log('Video player clicked');
    initializeProgressTracking();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up video event listeners');
      const video = videoRef.current;
      if (video) {
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('seeking', handleSeeking);
        video.removeEventListener('play', handlePlay);
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Fetch initial progress when component mounts
  useEffect(() => {
    const fetchProgress = async () => {
      if (!session?.user?.id || !reactionId) return;

      try {
        const response = await fetch(
          `/api/watch-progress?reactionId=${reactionId}`,
          { credentials: 'include' }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data?.timestamp) {
            console.log('Loaded previous progress:', data.timestamp);
            if (videoRef.current) {
              videoRef.current.currentTime = data.timestamp;
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setInitialProgressLoaded(true);
      }
    };

    if (session?.user?.id && reactionId) {
      fetchProgress();
    }
  }, [session?.user?.id, reactionId]);

  const saveProgress = async (currentTime: number, isCompleted: boolean = false) => {
    if (!session?.user?.id || !reactionId) {
      console.log('Missing required data:', { userId: session?.user?.id, reactionId });
      return;
    }

    console.log('Saving progress:', {
      reactionId,
      currentTime: Math.floor(currentTime),
      isCompleted
    });

    try {
      const response = await fetch('/api/watch-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reactionId,
          currentTime: Math.floor(currentTime),
          isCompleted
        }),
        credentials: 'include'
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to save progress:', {
          status: response.status,
          result
        });
        return;
      }

      console.log('Progress saved successfully:', result);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  if (!src) {
    return (
      <Skeleton>
        <div className="aspect-video w-full rounded-lg shadow-lg overflow-hidden" /> 
      </Skeleton>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("relative aspect-video w-full rounded-lg shadow-lg overflow-hidden", className)}
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={src}
        poster={poster}
        controls
        preload="metadata"
        onPlay={handlePlay}
      />
    </motion.div>
  );
}
