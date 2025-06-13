const axios = require('axios');

const verifyUser = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.body.userId;
    const token = req.headers.authorization;

    if (!userId || !token) {
      return res.status(401).json({ message: 'User ID and token required' });
    }

    const verifyUrl = `http://user-service-user-service-1:7100/api/auth/verify_token/${userId}`;

    const response = await axios.get(verifyUrl, {
      headers: {
        Authorization: token
      }
    });

    if (response.data && response.data.status === 'success') {
      next();
    } else {
      return res.status(403).json({ message: 'Invalid user token' });
    }

  } catch (error) {
    console.error('Error verifying user:', error.response?.data || error.message);
    return res.status(403).json({ message: 'Unauthorized or verification failed' });
  }
};

module.exports = verifyUser;