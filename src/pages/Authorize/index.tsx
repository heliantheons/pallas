import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Spinner } from '@heliannuuthus/ui/spinner';
import styles from './index.module.scss';

/** 公开授权入口保留原始查询参数，由后端验证并发起浏览器授权流程。 */
const AuthorizePage = () => {
  const { search } = useLocation();

  useEffect(() => {
    window.location.replace(`/api/authorize${search}`);
  }, [search]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.loading}>
          <Spinner />
          <p>正在处理授权请求...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthorizePage;
