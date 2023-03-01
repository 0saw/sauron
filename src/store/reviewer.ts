import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as api from '../api';
import { RepoContributorsResponse, User, UserReposResponse } from '../api/types';
import { SelectOption } from '../components/Select';
import { AppDispatch, RootState } from './index';

type State = {
  isVisible: boolean;

  user: string;
  repo: string;
  stopList: string[];

  repos: SelectOption[];
  contributors: SelectOption[];
  reviewer: User | null;
}

let initialState: State = {
  isVisible: true,

  user: '',
  repo: '',
  stopList: [],

  repos: [],
  contributors: [],
  reviewer: null,
};

try {
  const savedState = localStorage.getItem(process.env.REACT_APP_STORAGE_KEY!);

  if (savedState) {
    const parsedState = JSON.parse(savedState);

    initialState = parsedState?.reviewer ?? initialState;
  }
} catch {
  // no-op
}

export const fetchRepos = createAsyncThunk<UserReposResponse, string>(
  'reviewer/fetchRepos',
  (username) => api.fetchRepos(username),
);

export const fetchRepoContributors = createAsyncThunk<RepoContributorsResponse, [ owner: string, repo: string ]>(
  'reviewer/fetchRepoContributors',
  ([ owner, repo ]) => api.fetchRepoContributors(owner, repo),
);

export const fetchReviewer = createAsyncThunk<User, string>(
  'reviewer/fetchReviewer',
  (username) => api.fetchUser(username),
);

export const fetchRandomReviewer = createAsyncThunk<void, void, {
  dispatch: AppDispatch,
  state: RootState,
}>(
  'reviewer/fetchRandomReviewer',
  async (_, thunkAPI) => {
    const {
      contributors,
      stopList,
    } = thunkAPI.getState().reviewer;

    const reviewerLogin = contributors
      .filter((contributor) => contributor.value && !stopList.includes(`${contributor.value}`))
      .sort(() => Math.random() < 0.5 ? -1 : 1)[0]?.value;

    if (!reviewerLogin) {
      return;
    }

    await thunkAPI.dispatch(fetchReviewer(`${reviewerLogin}`));
  },
);

export const reviewerSlice = createSlice({
  name: 'reviewer',

  initialState,

  reducers: {
    setIsVisible(state, action: PayloadAction<boolean>) {
      state.isVisible = action.payload;
    },

    setUser(state, action: PayloadAction<string>) {
      state.user = action.payload;
    },

    setRepo(state, action: PayloadAction<string>) {
      state.repo = action.payload;
    },

    setStopList(state, action: PayloadAction<string[]>) {
      state.stopList = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchRepos.fulfilled, (state, { payload }) => {
        state.repos = payload.map((repo) => ({
          text: repo.full_name,
          value: repo.full_name,
        }));
      })
      .addCase(fetchRepos.rejected, (state) => {
        state.repos = [];
      });

    builder
      .addCase(fetchRepoContributors.fulfilled, (state, { payload }) => {
        state.contributors = payload.map((contributor) => ({
          text: contributor.login,
          value: contributor.login,
        }));
      })
      .addCase(fetchRepoContributors.rejected, (state) => {
        state.contributors = [];
      });

    builder
      .addCase(fetchReviewer.fulfilled, (state, { payload }) => {
        state.reviewer = payload;
      })
      .addCase(fetchReviewer.rejected, (state) => {
        state.reviewer = null;
      });
  },
});

export const { setIsVisible, setUser, setRepo, setStopList } = reviewerSlice.actions;
