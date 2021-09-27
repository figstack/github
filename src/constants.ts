import * as dotenv from 'dotenv';
dotenv.config();

const IS_DEV = true;
export const FRONTEND_ENDPOINT = IS_DEV ? 'http://localhost:3000' : 'https://figstack.com';
export const BACKEND_ENDPOINT = IS_DEV ? 'http://localhost:5000' : 'https://api.figstack.com';

// Used for reference
export const AUTH_FRONTEND = `${FRONTEND_ENDPOINT}/pages/api/auth/github/login`;
