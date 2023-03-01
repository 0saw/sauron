import { githubClient } from '../client';
import { RepoContributorsResponse, User, UserReposResponse } from './types';

export const fetchRepos = async (username: string) => (
  (
    await githubClient.get<UserReposResponse>(`/users/${username}/repos`, {
      params: {
        type: 'all',
        per_page: 100,
        sort: 'pushed',
      },
    })
  ).data
);

export const fetchRepoContributors = async (owner: string, repo: string) => (
  (
    await githubClient.get<RepoContributorsResponse>(`/repos/${owner}/${repo}/contributors`, {
      params: {
        per_page: 100,
      },
    })
  ).data
);

export const fetchUser = async (username: string) => (
  (await githubClient.get<User>(`/users/${username}`)).data
);
