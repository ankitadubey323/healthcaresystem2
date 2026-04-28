/* Shared UI Components - Premium Design System */

export const UIStyles = {
  // Button Styles
  primaryButton: {
    height: '48px',
    width: '100%',
    background: 'var(--accent-blue)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
  },
  secondaryButton: {
    height: '48px',
    width: '100%',
    background: 'transparent',
    color: 'var(--accent-blue)',
    border: '1px solid var(--accent-blue)',
    borderRadius: 'var(--radius-md)',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
  },
  outlinedButton: {
    height: '40px',
    background: 'transparent',
    color: 'var(--accent-blue)',
    border: '1px solid rgba(79, 142, 247, 0.3)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0 12px',
    transition: 'all var(--transition-fast)',
    fontFamily: 'inherit',
  },

  // Card Styles
  card: {
    background: 'var(--bg-card)',
    border: `1px solid var(--border-color)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
  },
  elevatedCard: {
    background: 'var(--bg-elevated)',
    border: `1px solid var(--border-color)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-md)',
  },

  // Input Styles
  input: {
    height: '48px',
    background: 'var(--bg-elevated)',
    border: `1px solid var(--border-color)`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    padding: '0 var(--spacing-lg)',
    fontFamily: 'inherit',
    transition: 'all var(--transition-base)',
  },
  inputPlaceholder: {
    color: 'var(--text-muted)',
  },
  inputFocus: {
    borderColor: 'var(--accent-blue)',
    boxShadow: `0 0 0 2px rgba(79, 142, 247, 0.1)`,
  },

  // Stat Card
  statCard: {
    background: 'var(--bg-card)',
    border: `1px solid var(--border-color)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    borderLeft: `3px solid var(--accent-blue)`,
  },

  // Chip/Filter
  filterChip: {
    height: '32px',
    padding: '0 var(--spacing-lg)',
    fontSize: '13px',
    borderRadius: 'var(--radius-full)',
    background: 'transparent',
    border: `1px solid var(--border-color)`,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    fontWeight: '500',
    fontFamily: 'inherit',
  },
  filterChipActive: {
    background: 'rgba(79, 142, 247, 0.15)',
    border: `1px solid var(--accent-blue)`,
    color: 'var(--accent-blue)',
  },

  // List Row Item
  listRowItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-lg)',
    padding: 'var(--spacing-lg)',
    borderBottom: `0.5px solid var(--border-color)`,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    '&:hover': {
      background: 'var(--bg-hover)',
    },
  },
  listRowIcon: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-elevated)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },

  // Bottom Navigation
  bottomNav: {
    height: '64px',
    background: 'var(--bg-card)',
    borderTop: `0.5px solid rgba(255, 255, 255, 0.08)`,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  navTab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: '500',
  },
  navTabActive: {
    color: 'var(--accent-blue)',
  },
};

export default UIStyles;
