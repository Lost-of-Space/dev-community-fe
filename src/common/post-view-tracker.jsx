import { useEffect, useState } from 'react';

const usePostViewTracker = (postId) => {
  const [isFirstViewToday, setIsFirstViewToday] = useState(false);

  useEffect(() => {
    const checkPostView = () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const viewsData = JSON.parse(localStorage.getItem('postViews') || '{}');

        // return false if post viewed today
        if (viewsData[postId] === today) {
          setIsFirstViewToday(false);
          return false;
        }

        // Getting view data
        const newViewsData = {
          ...viewsData,
          [postId]: today
        };

        localStorage.setItem('postViews', JSON.stringify(newViewsData));
        setIsFirstViewToday(true);
        return true;
      } catch (error) {
        console.error('Error tracking post view:', error);
        setIsFirstViewToday(true);
        return true;
      }
    };

    checkPostView();
  }, [postId]);

  return isFirstViewToday;
};

export default usePostViewTracker;