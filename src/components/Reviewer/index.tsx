import { User } from '../../api/types';
import styles from './index.module.css';

type Props = {
  user: User;
}

export const Reviewer = (props: Props) => {
  const { user } = props;

  return (
    <figure className={styles.user}>
      <img
        className={styles.image}
        src={user.avatar_url}
        alt={user.name}
        onError={(e) => (e.currentTarget.hidden = true)}
      />

      <figcaption className={styles.caption}>
        {user.name || user.bio}

        <small className={styles.subcaption}>
          {user.login}
        </small>
      </figcaption>
    </figure>
  )
}
