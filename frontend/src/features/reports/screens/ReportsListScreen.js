import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Searchbar, Text, TouchableRipple } from 'react-native-paper';
import ReportItem from '../../../components/ReportItem';
import { routes } from '../../../navigation/routes';
import { fetchReports } from '../../../services/reportservice';
import { colors, spacing } from '../../../theme';

const tabs = [
  { label: 'Tous', value: 'all' },
  { label: 'Brouillon', value: 'draft' },
  { label: 'Soumis', value: 'submitted' },
  { label: 'Approuvé', value: 'approved' },
  { label: 'Refusé', value: 'rejected' },
];

export default function ReportsListScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');

  // ─── Chargement des données ──────────────────────────────────────────────
  const loadReports = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchReports();
      setReports(data);
    } catch (err) {
      setError(err.message || 'Impossible de charger les rapports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Recharger à chaque fois que l'écran est affiché (retour de ReportDetail)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadReports();
    });
    return unsubscribe;
  }, [navigation, loadReports]);

  // ─── Filtrage local (rapide, sans appel API supplémentaire) ──────────────
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesTab =
        activeTab === 'all' || report.status === activeTab;
      const matchesSearch = report.title
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [reports, activeTab, query]);

  // ─── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableRipple onPress={() => loadReports()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableRipple>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadReports(true)}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Mes Rapports</Text>
        <Text style={styles.subtitle}>Suivi de tous vos rapports</Text>
      </View>

      <Searchbar
        iconColor={colors.textSecondary}
        inputStyle={styles.searchInput}
        onChangeText={setQuery}
        placeholder="Rechercher un rapport"
        placeholderTextColor={colors.textSecondary}
        style={styles.search}
        value={query}
      />

      <ScrollView
        horizontal
        contentContainerStyle={styles.tabs}
        showsHorizontalScrollIndicator={false}
      >
        {tabs.map((tab) => {
          const active = tab.value === activeTab;
          return (
            <TouchableRipple
              borderless
              key={tab.value}
              onPress={() => setActiveTab(tab.value)}
              style={[styles.tab, active && styles.activeTab]}
            >
              <Text style={[styles.tabText, active && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableRipple>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {filteredReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun rapport trouvé.</Text>
          </View>
        ) : (
          filteredReports.map((report) => (
            <TouchableRipple
              borderless
              key={report.id}
              onPress={() =>
                navigation.navigate(routes.REPORT_DETAIL, { reportId: report.id })
              }
            >
              <ReportItem {...report} />
            </TouchableRipple>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: {
    color: colors.white,
    fontWeight: '700',
  },
  header: {
    paddingTop: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
  },
  search: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 0,
    height: 46,
  },
  searchInput: {
    color: colors.textPrimary,
    fontSize: 13,
    minHeight: 46,
  },
  tabs: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  tab: {
    backgroundColor: colors.muted,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  activeTabText: {
    color: colors.textPrimary,
  },
  list: {
    gap: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});