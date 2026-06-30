import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GlassCard from '../../components/common/GlassCard';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { notificationApi } from '../../services/notificationApi';

// If notificationSlice thunks exist later, this page can be migrated.
// For now it consumes backend-facing notificationApi where implemented.
export default function NotificationCenterPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((s) => s.notification || { items: [], status: 'idle' });

  useEffect(() => {
    (async () => {
      try {
        // Prefer redux-managed notifications if slice exists.
        if (dispatch && notificationApi?.getNotifications) {
          const data = await notificationApi.getNotifications();
          // If slice provides an action, it will be handled in notificationSlice.
          // Otherwise, we just rely on API-driven rendering below using local state.
          // eslint-disable-next-line no-console
          console.log('Notifications fetched', data?.length);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
  }, [dispatch]);

  const list = items || [];

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Updates on wallet activity, security alerts, and more." />
      <GlassCard className="p-4">
        {status === 'loading' ? (
          <LoadingSpinner text="Loading notifications..." />
        ) : list.length === 0 ? (
          <EmptyState
            icon="bi-bell"
            title="All caught up"
            message="You don’t have any notifications right now."
          />
        ) : (
          <div className="list-group list-group-flush">
            {list.map((n) => (
              <div
                key={n.id || n._id}
                className={`list-group-item bg-transparent border-0 ${!n.isRead ? 'bg-sp-soft' : ''}`}
                style={{ borderTop: '1px solid var(--sp-border)' }}
              >
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${n.icon || 'bi-bell'}`} style={{ color: 'var(--sp-primary)' }} />
                      <h6 className="mb-1 fw-bold">{n.title || 'Notification'}</h6>
                    </div>
                    <p className="text-muted-sp mb-0 small">{n.message || ''}</p>
                  </div>
                  <div className="text-muted-sp small" style={{ whiteSpace: 'nowrap' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

