import { useState, useEffect, useRef, startTransition } from 'react';
import { getReceivedMentorshipRequests } from '../api/mentorshipApi';
import { getReceivedCollaborationRequests } from '../api/collaborationApi';

const STORAGE_KEY = 'notif_last_seen_count';

function getStoredCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : -1;
  } catch {
    return -1;
  }
}

function setStoredCount(count) {
  try {
    localStorage.setItem(STORAGE_KEY, String(count));
  } catch { /* ignore */ }
}

export default function useNotificationCount() {
  const [totalPending, setTotalPending] = useState(0);
  const [cleared, setCleared] = useState(false);
  const clearedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function fetchCount() {
      try {
        const [mentorRes, collabRes] = await Promise.allSettled([
          getReceivedMentorshipRequests({ page: 1, limit: 999 }),
          getReceivedCollaborationRequests({ page: 1, limit: 999 }),
        ]);

        let count = 0;

        if (mentorRes.status === 'fulfilled') {
          const mentorships = mentorRes.value.data.data || [];
          count += mentorships.filter((r) => r.status === 'pending').length;
        }

        if (collabRes.status === 'fulfilled') {
          const collaborations = collabRes.value.data.data || [];
          count += collaborations.filter((r) => r.status === 'pending').length;
        }

        if (!mounted) return;

        startTransition(() => {
          setTotalPending(count);

          const stored = getStoredCount();
          if (stored === -1 || stored !== count) {
            clearedRef.current = false;
            setCleared(false);
          }
        });
      } catch {
        /* not logged in — ignore */
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  function markSeen() {
    clearedRef.current = true;
    setCleared(true);
    setStoredCount(totalPending);
  }

  return { totalPending, cleared, markSeen };
}
