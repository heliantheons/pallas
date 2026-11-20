import { useState, useEffect } from 'react';
import { Button } from '@heliannuuthus/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@heliannuuthus/ui/avatar';
import { Spinner } from '@heliannuuthus/ui/spinner';
import { UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { getAuthContext, getConsentInfo, submitConsent } from '@/services/api';
import {
  showError,
  getErrorMessage,
  isFlowExpiredError,
  restartAuthFlow,
} from '@/utils/error';
import { smartNavigate } from '@/utils/navigation';
import type { AuthError, ConsentInfo } from '@/types';
import styles from './index.module.scss';

// Scope 图标和描述
const scopeConfig: Record<
  string,
  { icon: React.ReactNode; description: string }
> = {
  openid: {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
    description: '获取您的用户标识',
  },
  profile: {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    description: '获取您的昵称和头像',
  },
  email: {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
    description: '获取您的邮箱地址',
  },
  phone: {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
        />
      </svg>
    ),
    description: '获取您的手机号',
  },
  offline_access: {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
    description: '保持登录状态',
  },
};

function ConsentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [consentInfo, setConsentInfo] = useState<ConsentInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // 获取授权信息
  useEffect(() => {
    let active = true;
    const fetchConsentInfo = async () => {
      try {
        const [info] = await Promise.all([getConsentInfo(), getAuthContext()]);
        if (active) setConsentInfo(info);
      } catch (error: unknown) {
        if (!active) return;
        const err = error as AuthError;
        if (isFlowExpiredError(err) && restartAuthFlow()) return;
        setLoadError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchConsentInfo();
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  // 批准和拒绝都由后端返回带原始 state 的客户端回调地址。
  const handleConsent = async (confirm: boolean) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const action = await submitConsent(confirm);
      smartNavigate(action.location, navigate);
    } catch (error: unknown) {
      const err = error as AuthError;
      if (isFlowExpiredError(err) && restartAuthFlow()) return;
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingState}>
            <Spinner label="正在加载授权信息" />
            <p>正在加载授权信息...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!consentInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>无法加载授权请求</h1>
            <p className={styles.subtitle} role="alert">
              {loadError || '请从应用重新发起登录。'}
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              setLoading(true);
              setLoadError(null);
              setLoadAttempt((attempt) => attempt + 1);
            }}
          >
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* 连接指示器 */}
        <div className={styles.connectionIndicator}>
          <div className={styles.appIcon}>
            {consentInfo.client_logo ? (
              <img
                src={consentInfo.client_logo}
                alt={consentInfo.client_name}
              />
            ) : (
              <span>{consentInfo.client_name.charAt(0)}</span>
            )}
          </div>
          <div className={styles.connectionLine}>
            <svg viewBox="0 0 48 24" fill="none">
              <path
                d="M0 12h48"
                stroke="#e5e7eb"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
          </div>
          {/* Aegis Logo */}
          <div className={styles.appIcon}>
            <img src="/aegis.svg" alt="Aegis" />
          </div>
        </div>

        {/* 标题 */}
        <div className={styles.header}>
          <h1 className={styles.title}>{consentInfo.client_name}</h1>
          <p className={styles.subtitle}>请求访问您的 Aegis 账户</p>
        </div>

        {/* 用户信息 */}
        {consentInfo.user && (
          <div className={styles.userCard}>
            <Avatar className={styles.userAvatar}>
              <AvatarImage
                src={consentInfo.user.avatar}
                alt={consentInfo.user.nickname || '用户'}
              />
              <AvatarFallback>
                <UserRound size={20} aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <div className={styles.userDetails}>
              <span className={styles.userName}>
                {consentInfo.user.nickname || '用户'}
              </span>
              <span className={styles.userLabel}>当前登录账户</span>
            </div>
          </div>
        )}

        {/* 权限列表 */}
        <div className={styles.scopeSection}>
          <h3 className={styles.scopeTitle}>此应用将获得以下权限</h3>
          <div className={styles.scopeList}>
            {consentInfo.scopes.map((scope, index) => {
              const config = scopeConfig[scope.name] || {
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                description: scope.description,
              };
              // 后端把本次请求的全部 scope 标为必需；批准不缩减权限范围。

              return (
                <button
                  key={scope.name}
                  className={clsx(
                    styles.scopeItem,
                    styles.selected,
                    styles.required
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  disabled
                >
                  <div className={styles.scopeIcon}>{config.icon}</div>
                  <div className={styles.scopeContent}>
                    <span className={styles.scopeText}>
                      {config.description}
                    </span>
                    <span className={styles.requiredBadge}>必需</span>
                  </div>
                  <div className={styles.scopeCheck}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className={styles.actions}>
          <Button
            size="lg"
            variant="outline"
            type="button"
            onClick={() => handleConsent(false)}
            disabled={submitting}
            className={styles.denyButton}
          >
            拒绝
          </Button>
          <Button
            size="lg"
            type="button"
            onClick={() => handleConsent(true)}
            loading={submitting}
            className={styles.allowButton}
          >
            允许访问
          </Button>
        </div>

        {/* 页脚 */}
        <div className={styles.footer}>
          <p>授权后，您可以随时在账户设置中撤销此应用的访问权限</p>
        </div>
      </div>
    </div>
  );
}

export default ConsentPage;
