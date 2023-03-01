import styles from './App.module.css';
import { ChangeEvent, FormEvent, useCallback, useMemo, useState } from 'react';
import { Select } from './components/Select';
import { useRequest } from './hooks/useRequest';
import { fetchRepoContributors, fetchRepos, fetchUser } from './api';
import { User } from './api/types';
import { Reviewer } from './components/Reviewer';
import { useLocalStorage } from './hooks/useLocalStorage';

const useUser = () => {
  const [ user, setUser ] = useLocalStorage('user', '');

  const {
    run,
    clear,
    data: reposFromResponse,
  } = useRequest(fetchRepos, {
    manual: user === '',
    params: [ user ]
  });

  const repos = useMemo(() => {
    if (!Array.isArray(reposFromResponse) || reposFromResponse.length === 0) {
      return [];
    }

    return [
      {
        text: 'Выберите репозиторий из списка',
        value: '',
        disabled: true,
      },

      ...reposFromResponse.map((repo) => ({
        text: repo.full_name,
        value: repo.full_name,
      })),
    ];
  }, [ reposFromResponse ]);

  const handleUserChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    setUser(e.currentTarget.value);

    if (!value) {
      clear()
    } else {
      run(value);
    }
  }, [ setUser, clear, run ]);

  return {
    user,
    handleUserChange,
    hasRepos: Array.isArray(reposFromResponse) && reposFromResponse.length > 0,
    repos,
  };
};

const useRepo = () => {
  const [ repo, setRepo ] = useLocalStorage('repo', '');
  const [ ownerBit, repoBit ] = repo.split('/');

  const {
    run,
    clear,
    data: contributorsFromResponse,
  } = useRequest(fetchRepoContributors, {
    manual: typeof repoBit === 'undefined',
    params: [ ownerBit, repoBit ],
  });

  const contributors = useMemo(() => {
    if (!Array.isArray(contributorsFromResponse) || contributorsFromResponse.length === 0) {
      return [];
    }

    return [
      {
        text: '',
        value: '',
      },

      ...contributorsFromResponse.map((contributor) => ({
        text: contributor.login,
        value: contributor.login,
      })),
    ];
  }, [ contributorsFromResponse ]);

  const handleRepoChange = useCallback((e: ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
    setRepo(e.target.value);

    const [ ownerBit, repoBit ] = e.target.value.split('/');

    if (!repoBit) {
      clear();
    } else {
      run(ownerBit, repoBit);
    }
  }, [ setRepo, run, clear ]);

  return {
    repo,
    handleRepoChange,
    hasContributors: Array.isArray(contributorsFromResponse) && contributorsFromResponse.length > 0,
    contributors,
  };
};

export const App = () => {
  const [ isVisible, setIsVisible ] = useLocalStorage('isVisible', true);
  const [ reviewer, setReviewer ] = useState<User | null>(null);

  const { user, handleUserChange, hasRepos, repos } = useUser();
  const { repo, handleRepoChange, hasContributors, contributors } = useRepo();
  const [ stopList, setStopList ] = useLocalStorage<string[]>('stopList', []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const reviewerLogin = contributors
      .filter((contributor) => contributor.value && !stopList.includes(contributor.value))
      .sort(() => Math.random() < 0.5 ? -1 : 1)[0]?.value

    if (!reviewerLogin) {
      return;
    }

    try {
      setReviewer(await fetchUser(reviewerLogin));
    } catch {
      alert('Could not fetch user');
    }
  }, [ contributors, stopList ]);

  const handleStopListChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setStopList(
      [ ...e.currentTarget.selectedOptions ].map((option) => option.value),
    );
  }, [ setStopList ]);

  return (
    <>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <details
          open={isVisible}
          onToggle={(e) => setIsVisible(e.currentTarget.open)}
        >
          <summary>
            Настройки
          </summary>

          <label>
            Пользователь Github

            <input
              name="user"
              type="text"
              value={user}
              placeholder="Например hhru"
              onChange={handleUserChange}
            />
          </label>

          <label>
            Репозиторий

            {hasRepos ? (
              <Select
                name="repo"
                options={repos}
                value={repo}
                required
                onChange={handleRepoChange}
              />
            ) : (
              <input
                name="repo"
                type="text"
                value={repo}
                placeholder="Например hhru/api"
                required
                onChange={handleRepoChange}
              />
            )}
          </label>

          <label>
            Черный список

            <Select
              disabled={!hasContributors}
              name="stopList"
              options={contributors}
              size={5}
              value={stopList}
              multiple
              onChange={handleStopListChange}
            />
          </label>
        </details>

        <div className="flex-container align-center">
          <button className="button">
            Выбрать ревьюера
          </button>
        </div>

        {reviewer && (
          <Reviewer user={reviewer} />
        )}
      </form>
    </>
  );
};
