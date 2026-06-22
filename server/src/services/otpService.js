const otpStore = new Map();

export const otpService = {
  setOtp: (email, generatedOtp) => {
    otpStore.set(email.toLowerCase(), {
      otp: generatedOtp,
      verified: false,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
    });
  },

  getOtp: (email) => {
    return otpStore.get(email.toLowerCase());
  },

  setVerified: (email, record) => {
    otpStore.set(email.toLowerCase(), {
      ...record,
      verified: true,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes post-verification validity
    });
  },

  deleteOtp: (email) => {
    otpStore.delete(email.toLowerCase());
  }
};
