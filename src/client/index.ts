import axios from 'axios';

export const githubClient = axios.create({
  baseURL: process.env.REACT_APP_SERVICE_GITHUB_URL,
  timeout: 10_000,
});
