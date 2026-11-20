import { useEffect, useState } from 'react';
import { Button } from '@heliannuuthus/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@heliannuuthus/ui/dialog';
import { FLOW_EXPIRED_EVENT } from '@/utils/error';
import styles from './FlowExpiredDialog.module.scss';

export default function FlowExpiredDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(FLOW_EXPIRED_EVENT, show);
    return () => window.removeEventListener(FLOW_EXPIRED_EVENT, show);
  }, []);

  return (
    <Dialog open={open}>
      <DialogContent
        className={styles.content}
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>登录会话已过期</DialogTitle>
          <DialogDescription>
            当前认证流程已失效，请重新加载页面。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className={styles.reloadButton}
            type="button"
            onClick={() => window.location.reload()}
          >
            重新加载
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
