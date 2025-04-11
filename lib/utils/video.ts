// Helper function to wait for a specified time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getVideoDuration(videoUrl: string, maxRetries = 3): Promise<number | undefined> {
  // For production use, we'll rely on pre-fetched durations stored in the database
  // This avoids rate limiting issues with the Streamable API
  return undefined;
}

// Keep this function for seeding purposes only
export async function fetchVideoDurationFromAPI(videoUrl: string, maxRetries = 3): Promise<number | undefined> {
  if (videoUrl.includes("streamable.com")) {
    const segments = videoUrl.split("/");
    const videoId = segments[segments.length - 1];
    
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        const res = await fetch(`https://api.streamable.com/videos/${videoId}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ReactionHub/1.0'
          }
        });
        
        // Handle rate limiting
        if (res.status === 429) {
          retries++;
          if (retries > maxRetries) {
            console.error(`Rate limit exceeded after ${maxRetries} retries`);
            return undefined;
          }
          
          // Get retry-after header or use exponential backoff
          const retryAfter = res.headers.get('retry-after');
          const waitTime = retryAfter 
            ? parseInt(retryAfter, 10) * 1000 
            : Math.min(1000 * Math.pow(2, retries), 10000); // Exponential backoff with 10s max
          
          console.log(`Rate limited by Streamable API. Retrying in ${waitTime/1000}s (attempt ${retries}/${maxRetries})`);
          await sleep(waitTime);
          continue;
        }
        
        // Check if response is OK before parsing JSON
        if (!res.ok) {
          console.error(`Error fetching Streamable video: ${res.status} ${res.statusText}`);
          return undefined;
        }
        
        const data = await res.json();
        
        // Try multiple possible paths for duration in the API response
        const duration = data?.files?.mp4?.duration || 
                         data?.duration ||
                         data?.length;
        
        if (duration) {
          return duration;
        } else {
          console.warn(`No duration found in API response for ${videoId}`);
          return undefined;
        }
      } catch (error) {
        console.error("Error fetching Streamable video duration:", error);
        return undefined;
      }
    }
  }
  
  // Add support for other video providers (Google Drive, etc.) here
  return undefined;
}
