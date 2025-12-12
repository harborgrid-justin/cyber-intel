
import { createSlice } from '../createStore';
import { NotificationsState, Notification } from '../types';

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  filter: 'all',
  sound: true,
  desktop: true
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, notification: Notification) => {
      const newItems = [notification, ...state.items];
      const newUnreadCount = !notification.read ? state.unreadCount + 1 : state.unreadCount;

      return {
        ...state,
        items: newItems,
        unreadCount: newUnreadCount
      };
    },

    removeNotification: (state, id: string) => {
      const notification = state.items.find(n => n.id === id);
      const newItems = state.items.filter(n => n.id !== id);
      const newUnreadCount = notification && !notification.read
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount;

      return {
        ...state,
        items: newItems,
        unreadCount: newUnreadCount
      };
    },

    markAsRead: (state, id: string) => {
      const notification = state.items.find(n => n.id === id);
      const wasUnread = notification && !notification.read;

      return {
        ...state,
        items: state.items.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      };
    },

    markAsUnread: (state, id: string) => {
      const notification = state.items.find(n => n.id === id);
      const wasRead = notification && notification.read;

      return {
        ...state,
        items: state.items.map(n =>
          n.id === id ? { ...n, read: false } : n
        ),
        unreadCount: wasRead ? state.unreadCount + 1 : state.unreadCount
      };
    },

    markAllAsRead: (state) => ({
      ...state,
      items: state.items.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }),

    clearAll: () => initialState,

    clearRead: (state) => {
      const unreadItems = state.items.filter(n => !n.read);
      return {
        ...state,
        items: unreadItems
      };
    },

    setFilter: (state, filter: 'all' | 'unread') => ({
      ...state,
      filter
    }),

    setSoundEnabled: (state, enabled: boolean) => ({
      ...state,
      sound: enabled
    }),

    setDesktopEnabled: (state, enabled: boolean) => ({
      ...state,
      desktop: enabled
    }),

    bulkDelete: (state, ids: string[]) => {
      const idsSet = new Set(ids);
      const removedUnreadCount = state.items
        .filter(n => idsSet.has(n.id) && !n.read)
        .length;

      return {
        ...state,
        items: state.items.filter(n => !idsSet.has(n.id)),
        unreadCount: Math.max(0, state.unreadCount - removedUnreadCount)
      };
    }
  }
});

export const notificationsActions = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;

// Selectors
export const notificationsSelectors = {
  selectAll: (state: NotificationsState) => state.items,

  selectFiltered: (state: NotificationsState) =>
    state.filter === 'unread'
      ? state.items.filter(n => !n.read)
      : state.items,

  selectUnread: (state: NotificationsState) =>
    state.items.filter(n => !n.read),

  selectUnreadCount: (state: NotificationsState) => state.unreadCount,

  selectByType: (state: NotificationsState, type: string) =>
    state.items.filter(n => n.type === type),

  selectCritical: (state: NotificationsState) =>
    state.items.filter(n => n.type === 'critical' || n.type === 'error'),

  selectRecent: (state: NotificationsState, hours: number = 24) => {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return state.items.filter(n => n.timestamp > cutoff);
  },

  selectFilter: (state: NotificationsState) => state.filter,

  selectSoundEnabled: (state: NotificationsState) => state.sound,

  selectDesktopEnabled: (state: NotificationsState) => state.desktop
};
