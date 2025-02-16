import dotenv from 'dotenv';

dotenv.config();

export const config = {
  GPT4O_ENDPOINT: process.env.GPT4O_ENDPOINT || '',
  GPT4O_API_KEY: process.env.GPT4O_API_KEY || '',
  // Add other config values as needed
}; 