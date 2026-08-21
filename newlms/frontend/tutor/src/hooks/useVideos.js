import { useState, useEffect, useCallback } from 'react';
import { videoService } from '../services/videoService';

export const useVideos = (courseId) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVideos = useCallback(() => {
    if (!courseId) return;
    setLoading(true);
    try {
      const data = videoService.getVideos(courseId);
      setVideos(data);
      setError(null);
    } catch (e) {
      setError('Failed to fetch videos.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const addVideo = async (videoData) => {
    try {
      const newVideo = videoService.addVideo(courseId, videoData);
      setVideos(prev => [...prev, newVideo]);
      return newVideo;
    } catch (e) {
      setError('Failed to add video.');
      throw e;
    }
  };

  const updateVideo = async (videoId, videoData) => {
    try {
      const updated = videoService.updateVideo(courseId, videoId, videoData);
      setVideos(prev => prev.map(v => v.id === videoId ? updated : v));
      return updated;
    } catch (e) {
      setError('Failed to update video.');
      throw e;
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      videoService.deleteVideo(courseId, videoId);
      setVideos(prev => prev.filter(v => v.id !== videoId));
      return true;
    } catch (e) {
      setError('Failed to delete video.');
      throw e;
    }
  };

  return {
    videos,
    loading,
    error,
    refreshVideos: fetchVideos,
    addVideo,
    updateVideo,
    deleteVideo
  };
};
