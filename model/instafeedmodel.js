const axios = require('axios');

// Instagram Graph API URL and access token
const accessToken = 'EAAHHE4tDdh0BO6E9BCJdP4B0NUzdw7nqAxEw8I8L4FxzgRkf6ZCZCC48AfHuqqScK7QhaRQJHgsIsSkZCjciRPQzMMfGIYZCUx8JSbs1fIZBwKlO0xcBzG1KDgYmDTPbLVUAMq0KeIB0TmNL1F5ixc9qERLSijt22yf22em7DCaFQMRP0wYWEIOqQ';

// Function to fetch Instagram data
const fetchInstagramData = async () => {
  const url = "https://graph.facebook.com/17841401994416697?fields=business_discovery.username(paljibakeryldh){followers_count,media_count,biography,profile_picture_url,website,follows_count,ig_id,name,media.limit(50){caption,comments_count,like_count,save_count,media_url,media_type,timestamp,permalink,thumbnail_url,video_url,children}}&access_token=" + accessToken;    

  try {
    // Fetch data from Instagram API
    const response = await axios.get(url);
    const media = response.data.business_discovery.media.data;

    // Return filtered and sorted media
    return media
      .filter((item) => item.media_type === 'VIDEO' || item.media_type === 'IMAGE')
      .sort((a, b) => {
        const aEngagement = a.comments_count + a.like_count + a.save_count;
        const bEngagement = b.comments_count + b.like_count + b.save_count;
        return bEngagement - aEngagement;
      });
  } catch (error) {
    throw new Error('Failed to fetch Instagram data');
  }
};


module.exports = { fetchInstagramData };