import { useMemo, useState } from 'react';
import { addDays } from 'date-fns';
import type { TimeEntryContext, TimeEntryModalMode } from '../../types/timeEntry';

type ModalState = {
  open: boolean;
  context?: TimeEntryContext;
  mode?: TimeEntryModalMode;
};

export function useContent() {
  const [viewMode, setViewMode] = useState<'user' | 'task'>('user');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [dateView, setDateView] = useState<'day' | '3day' | 'week'>('week');
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    mode: 'create',
  });

  const stepByView = useMemo(() => {
    if (dateView === 'day') return 1;
    if (dateView === '3day') return 3;
    return 7;
  }, [dateView]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) =>
      addDays(prev, direction === 'next' ? stepByView : -stepByView),
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const openModal = (context?: TimeEntryContext, mode: TimeEntryModalMode = 'create') => {
    setModalState({ open: true, context, mode });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, open: false }));
  };

  const handleSubmitModal = () => {
    setModalState((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteModal = () => {
    // TODO: 削除処理を実装
    setModalState((prev) => ({ ...prev, open: false }));
  };

  const handleDuplicateModal = () => {
    // 編集モーダルを閉じて、複製モーダルを開く
    // 既存のコンテキストを保持して複製モードで開く
    const currentContext = modalState.context;
    // 一度モーダルを閉じる
    setModalState((prev) => ({ ...prev, open: false }));
    // モーダルのアニメーションが完了してから複製モーダルを開く
    setTimeout(() => {
      setModalState({ open: true, context: currentContext, mode: 'duplicate' });
    }, 300); // アニメーション時間（CSSのtransition時間に合わせる）
  };

  const handleCalendarEntry = (context: TimeEntryContext) => {
    // イベントクリックの場合は編集モード、それ以外は作成モード
    const mode = context?.source === 'event' ? 'edit' : 'create';
    openModal(context, mode);
  };

  const handleDuplicateEntry = (context: TimeEntryContext) => {
    // 複製モードでモーダルを開く
    openModal(context, 'duplicate');
  };

  const handleCreateEntry = () => {
    const now = new Date();
    now.setSeconds(0, 0); // 秒を0にリセット（分単位）
    openModal({
      source: 'button',
      start: now,
    });
  };

  return {
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    dateView,
    setDateView,
    modalState,
    handleNavigate,
    handleToday,
    handleCloseModal,
    handleSubmitModal,
    handleDeleteModal,
    handleDuplicateModal,
    handleCalendarEntry,
    handleDuplicateEntry,
    handleCreateEntry,
  };
}
