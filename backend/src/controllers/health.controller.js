/**
 * Health Check Controller
 * Validates that the API service is up and responsive.
 */
export const getHealth = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'ZeroTrust Assignment Gateway API is running',
  });
};
