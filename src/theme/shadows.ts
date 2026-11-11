export const getShadows = (isDark: boolean) => ({
  sm: {
    shadowColor: isDark ? '#000000' : '#0F172A',
    shadowOpacity: isDark ? 0.35 : 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  card: {
    shadowColor: isDark ? '#000000' : '#0F172A',
    shadowOpacity: isDark ? 0.45 : 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  elevated: {
    shadowColor: isDark ? '#000000' : '#0F172A',
    shadowOpacity: isDark ? 0.6 : 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
