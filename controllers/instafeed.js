const { fetchInstagramData } = require('../model/instafeedmodel');

// Controller function to get the Instagram feed
const getInstagramFeed = async (req, res) => {
  try {
    const feed = await fetchInstagramData();
    res.json({
      status: 'success',
      data: feed,
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch Instagram feed',
      error  : error
    });
  }
};

module.exports = { getInstagramFeed };