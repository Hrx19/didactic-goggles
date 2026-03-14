import axios from 'axios';

// Verify reCAPTCHA token
export const verifyRecaptcha = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification required',
      });
    }

    // Verify with Google reCAPTCHA
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    );

    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'reCAPTCHA verification error',
    });
  }
};