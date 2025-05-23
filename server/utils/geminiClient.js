/**
 * Centralized Gemini API client configuration
 * This file ensures consistent API version settings across the application
 * and implements caching to improve performance and reduce API costs
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Simple in-memory cache
const responseCache = new Map();

// Cache directory for persistent caching
const CACHE_DIR = path.join(__dirname, '../cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log(`Created cache directory at ${CACHE_DIR}`);
  } catch (err) {
    console.error(`Failed to create cache directory: ${err.message}`);
  }
}

// Create a custom configuration for the Gemini API client
const createGeminiClient = () => {
  // Get API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  // Create the client with explicit API version
  // The second parameter is the requestOptions object
  const genAI = new GoogleGenerativeAI(apiKey);

  // Helper function to generate a cache key from request
  const generateCacheKey = (request) => {
    // Create a deterministic string representation of the request
    const requestString = JSON.stringify(request);
    // Create a hash of the request string
    return crypto.createHash('md5').update(requestString).digest('hex');
  };

  // Helper function to check if a response is cached
  const getFromCache = (cacheKey) => {
    // First check in-memory cache
    if (responseCache.has(cacheKey)) {
      console.log(`Cache hit for key ${cacheKey} (in-memory)`);
      return responseCache.get(cacheKey);
    }

    // Then check file cache
    const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    if (fs.existsSync(cacheFilePath)) {
      try {
        const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
        // Add to in-memory cache for faster access next time
        responseCache.set(cacheKey, cachedData);
        console.log(`Cache hit for key ${cacheKey} (file)`);
        return cachedData;
      } catch (err) {
        console.error(`Error reading cache file: ${err.message}`);
      }
    }

    return null;
  };

  // Helper function to save response to cache
  const saveToCache = (cacheKey, response) => {
    // Save to in-memory cache
    responseCache.set(cacheKey, response);

    // Save to file cache
    const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    try {
      fs.writeFileSync(cacheFilePath, JSON.stringify(response));
      console.log(`Saved response to cache for key ${cacheKey}`);
    } catch (err) {
      console.error(`Error writing to cache file: ${err.message}`);
    }
  };

  // Create a function to get a model with the correct API version
  const getModel = (modelName = 'gemini-pro') => {
    // Map of model name variations to try - based on Google's documentation
    // Updated to prioritize the most reliable models first
    const modelVariations = {
      'gemini-pro': ['gemini-1.5-flash', 'models/gemini-1.5-flash', 'gemini-1.5-pro', 'models/gemini-1.5-pro'],
      'gemini-1.0-pro': ['gemini-1.5-flash', 'models/gemini-1.5-flash', 'gemini-1.5-pro', 'models/gemini-1.5-pro'],
      'gemini-1.5-pro': ['gemini-1.5-flash', 'models/gemini-1.5-flash', 'gemini-1.5-pro', 'models/gemini-1.5-pro'],
      'gemini-1.5-flash': ['gemini-1.5-flash', 'models/gemini-1.5-flash', 'gemini-pro', 'models/gemini-pro']
    };

    // Get the variations to try based on the requested model
    const variationsToTry = modelVariations[modelName] || [modelName, `models/${modelName}`];

    // Log which model we're trying to create
    console.log(`Attempting to create Gemini model with variations of ${modelName} using API version v1`);

    // Try the first variation
    const firstVariation = variationsToTry[0];
    console.log(`Using model name: ${firstVariation}`);

    // Create the model with explicit API version
    const model = genAI.getGenerativeModel({
      model: firstVariation
    }, {
      // Force v1 API version in the request options
      apiVersion: 'v1'
    });

    // Store the other variations to try if the first one fails
    model._alternativeNames = variationsToTry.slice(1);

    // Helper function for exponential backoff
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Wrap the generateContent method to handle fallbacks, retries, and caching
    const originalGenerateContent = model.generateContent.bind(model);
    model.generateContent = async function(request) {
      // Maximum number of retries for rate limit errors
      const MAX_RETRIES = 3;
      let retryCount = 0;
      let lastError = null;

      // Generate cache key for this request
      const cacheKey = generateCacheKey(request);

      // Check if we have a cached response
      const cachedResponse = getFromCache(cacheKey);
      if (cachedResponse) {
        console.log(`Using cached response for request`);
        // Return the cached response in the same format as the API would
        return {
          response: {
            text: () => cachedResponse.text,
            candidates: cachedResponse.candidates,
            promptFeedback: cachedResponse.promptFeedback
          }
        };
      }

      // Retry loop with exponential backoff
      while (retryCount <= MAX_RETRIES) {
        try {
          console.log(`Attempting to generate content with model: ${firstVariation}`);
          console.log(`API Version: v1`);
          console.log(`Retry count: ${retryCount}`);

          // Only log the request structure in development, not the full content (to avoid logging sensitive data)
          const requestStructure = {
            ...request,
            contents: request.contents ? `[${request.contents.length} content items]` : undefined
          };
          console.log(`Request structure:`, JSON.stringify(requestStructure, null, 2));

          // Try with the current model name
          const result = await originalGenerateContent(request);

          // Cache the successful response
          try {
            const responseText = result.response.text();
            saveToCache(cacheKey, {
              text: responseText,
              candidates: result.response.candidates,
              promptFeedback: result.response.promptFeedback
            });
          } catch (cacheError) {
            console.error(`Error caching response: ${cacheError.message}`);
          }

          return result;
        } catch (error) {
          lastError = error;
          console.error(`Error generating content with model ${firstVariation}:`, error);
          console.error(`Error status: ${error.status}, message: ${error.message}`);

          // Check if this is a rate limit error (429)
          if (error.status === 429) {
            if (retryCount < MAX_RETRIES) {
              // Calculate backoff time: 2^retryCount * 1000ms + random jitter
              const backoffTime = (Math.pow(2, retryCount) * 1000) + (Math.random() * 1000);
              console.log(`Rate limit exceeded. Retrying in ${Math.round(backoffTime/1000)} seconds...`);

              // Wait for the backoff period
              await sleep(backoffTime);
              retryCount++;
              continue;
            } else {
              console.error(`Maximum retries (${MAX_RETRIES}) exceeded for rate limit errors.`);
            }
          }

          // If we have alternative names to try and this is a 404 or 400 error
          if (model._alternativeNames && model._alternativeNames.length > 0 &&
              (error.status === 404 || error.status === 400 || error.status === 429)) {
            // Get the next model name to try
            const nextModelName = model._alternativeNames.shift();
            console.log(`Current model failed. Trying alternative: ${nextModelName}`);

            // Create a new model with the alternative name
            const alternativeModel = genAI.getGenerativeModel({
              model: nextModelName
            }, {
              apiVersion: 'v1'
            });

            // Try with the alternative model
            try {
              console.log(`Attempting to generate content with alternative model: ${nextModelName}`);
              return await alternativeModel.generateContent(request);
            } catch (altError) {
              console.error(`Error with alternative model ${nextModelName}:`, altError);
              // If we have more alternatives, continue with the loop
              if (model._alternativeNames.length > 0) {
                // Recursively try the next alternative
                return await model.generateContent(request);
              }
              throw altError;
            }
          }

          // Break out of the retry loop for non-retryable errors
          break;
        }
      }

      // If we've exhausted all retries and alternatives, throw the last error
      throw lastError;
    };

    return model;
  };

  return {
    genAI,
    getModel
  };
};

// Export a singleton instance
const geminiClient = createGeminiClient();
module.exports = geminiClient;
