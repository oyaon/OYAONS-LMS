const axios = require('axios');
require('dotenv').config(); // Ensure environment variables are loaded

// --- Bkash API Configuration ---
const BKASH_BASE_URL = process.env.BKASH_BASE_URL || 'https://checkout.sandbox.bka.sh/v1.2.0-beta'; // Use sandbox by default
const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET;
const BKASH_USERNAME = process.env.BKASH_USERNAME;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD;
const BKASH_CALLBACK_URL = process.env.BKASH_CALLBACK_URL; // e.g., https://yourapi.com/api/payments/bkash/callback

if (!BKASH_APP_KEY || !BKASH_APP_SECRET || !BKASH_USERNAME || !BKASH_PASSWORD || !BKASH_CALLBACK_URL) {
  console.warn('WARNING: Bkash environment variables (BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD, BKASH_CALLBACK_URL) are not fully configured. Bkash payments will likely fail.');
}

let bkashToken = null;
let tokenExpireTime = null;

// --- Helper Functions ---

/**
 * Gets a Bkash Auth Token, refreshing if expired.
 */
const getBkashToken = async () => {
  if (bkashToken && tokenExpireTime && new Date() < tokenExpireTime) {
    return bkashToken; // Return cached token
  }

  console.log('Requesting new Bkash token...');
  try {
    const response = await axios.post(`${BKASH_BASE_URL}/checkout/token/grant`,
      {
        app_key: BKASH_APP_KEY,
        app_secret: BKASH_APP_SECRET
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'username': BKASH_USERNAME,
          'password': BKASH_PASSWORD,
        }
      }
    );

    if (response.data && response.data.id_token) {
      bkashToken = response.data.id_token;
      // Set expiry time slightly before actual expiry (e.g., 5 minutes before)
      const expiresInSeconds = response.data.expires_in || 3600; // Default to 1 hour
      tokenExpireTime = new Date(Date.now() + (expiresInSeconds - 300) * 1000);
      console.log('New Bkash token obtained.');
      return bkashToken;
    } else {
      throw new Error('Failed to retrieve Bkash token: Invalid response format');
    }
  } catch (error) {
    console.error('Error getting Bkash token:', error.response ? error.response.data : error.message);
    bkashToken = null; // Reset token on error
    tokenExpireTime = null;
    throw new Error(`Bkash token grant failed: ${error.response?.data?.errorMessage || error.message}`);
  }
};

/**
 * Creates a Bkash payment request.
 * @param {number} amount Payment amount.
 * @param {string} merchantInvoiceNumber Our internal unique ID for this payment (e.g., Payment model _id).
 * @param {string} intent Usually 'sale'.
 * @returns {Promise<object>} Bkash response object containing paymentID and bkashURL.
 */
const createBkashPayment = async (amount, merchantInvoiceNumber, intent = 'sale') => {
  try {
    const token = await getBkashToken();
    const payload = {
      mode: '0011', // Mode for Checkout URL
      payerReference: ' ', // Required but can be empty for mode 0011
      callbackURL: BKASH_CALLBACK_URL,
      amount: amount.toString(),
      currency: 'BDT',
      intent: intent,
      merchantInvoiceNumber: merchantInvoiceNumber
    };

    console.log('Creating Bkash payment with payload:', payload);

    const response = await axios.post(`${BKASH_BASE_URL}/checkout/create`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'X-APP-Key': BKASH_APP_KEY
        }
      }
    );

    console.log('Bkash create payment response:', response.data);

    // Check for Bkash specific error codes or success
    if (response.data && response.data.paymentID && response.data.bkashURL) {
        if (response.data.statusCode === '0000') {
            return response.data;
        } else {
            throw new Error(`Bkash create payment failed: ${response.data.statusMessage} (Code: ${response.data.statusCode})`);
        }
    } else {
      throw new Error('Invalid response from Bkash create payment API');
    }

  } catch (error) {
    console.error('Error creating Bkash payment:', error.response ? error.response.data : error.message);
    // Handle specific Bkash errors if needed based on error.response.data.errorCode
    throw new Error(`Bkash create payment failed: ${error.message}`);
  }
};

/**
 * Executes a Bkash payment after user confirmation and callback.
 * @param {string} paymentID The paymentID received from Bkash create API.
 * @returns {Promise<object>} Bkash response object containing transaction details (trxID, status, etc.).
 */
const executeBkashPayment = async (paymentID) => {
  try {
    const token = await getBkashToken();

    console.log(`Executing Bkash payment for paymentID: ${paymentID}`);

    const response = await axios.post(`${BKASH_BASE_URL}/checkout/execute`,
      { paymentID },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'X-APP-Key': BKASH_APP_KEY
        }
      }
    );

    console.log('Bkash execute payment response:', response.data);

    // The execute response structure might vary slightly, adjust checks as needed
    if (response.data && (response.data.statusCode === '0000' || response.data.transactionStatus)) {
        // Even if statusCode is not 0000, check transactionStatus for final state
        return response.data;
    } else {
        throw new Error(`Bkash execute payment failed: ${response.data.statusMessage || 'Unknown Error'} (Code: ${response.data.statusCode || 'N/A'})`);
    }

  } catch (error) {
    console.error('Error executing Bkash payment:', error.response ? error.response.data : error.message);
    throw new Error(`Bkash execute payment failed: ${error.message}`);
  }
};

module.exports = {
  getBkashToken,
  createBkashPayment,
  executeBkashPayment
}; 