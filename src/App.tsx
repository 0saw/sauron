import styles from './App.module.css';
import { ChangeEvent, FormEvent, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  fetchRandomReviewer,
  fetchRepoContributors,
  fetchRepos,
  setIsVisible,
  setRepo,
  setStopList,
  setUser,
} from './store/reviewer';
import { Select } from './components/Select';
import { Reviewer } from './components/Reviewer';

export const App = () => {
  const dispatch = useAppDispatch();

  const [
    isVisible,

    user,
    repo,
    stopList,

    hasRepos,
    repos,

    hasContributors,
    contributors,

    reviewer,
  ] = useAppSelector((state) => [
    state.reviewer.isVisible,

    state.reviewer.user,
    state.reviewer.repo,
    state.reviewer.stopList,

    state.reviewer.repos.length > 0,
    [
      {
        text: 'Выберите репозиторий',
        value: '',
      },
      ...state.reviewer.repos,
    ],

    state.reviewer.contributors.length > 0,
    [
      {
        text: '',
        value: '',
      },
      ...state.reviewer.contributors,
    ],

    state.reviewer.reviewer,
  ]);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(fetchRandomReviewer())
  }, [ dispatch ]);

  const handleUserChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch(setUser(e.currentTarget.value));
    dispatch(fetchRepos(e.currentTarget.value));
  }, [ dispatch ]);

  const handleRepoChange = useCallback((e: ChangeEvent<HTMLSelectElement & HTMLInputElement>) => {
    dispatch(setRepo(e.currentTarget.value));

    const [ ownerBit, reviewerBit ] = e.currentTarget.value.split('/', 2);
    if (!reviewerBit) {
      return;
    }

    dispatch(fetchRepoContributors([ ownerBit, reviewerBit ]));
  }, [ dispatch ]);

  const handleStopListChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setStopList(
      [ ...e.currentTarget.selectedOptions ].map((option) => option.value),
    ));
  }, [ dispatch ]);

  return (
    <>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <details
          open={isVisible}
          onToggle={(e) => dispatch(setIsVisible(e.currentTarget.open))}
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
