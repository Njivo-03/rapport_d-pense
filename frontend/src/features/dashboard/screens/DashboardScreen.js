import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import AppCard from '../../../components/AppCard';
import ExpenseItem from '../../../components/ExpenseItem';
import StatisticCard from '../../../components/StatisticCard';
import { routes } from '../../../navigation/routes';
import { colors, spacing } from '../../../theme';
import { useExpenses } from '../../expenses/contexts/ExpensesContext';

// ─── Couleurs pour le camembert et la légende ─────────────────────────────────
const CATEGORY_COLORS = {
  RESTAURANT:      { color: colors.primary,       label: 'Restaurant' },
  TRANSPORT:       { color: colors.info,           label: 'Transport' },
  OFFICE_SUPPLIES: { color: colors.warning,        label: 'Fournitures' },
  HOTEL:           { color: '#A78BFA',             label: 'Hôtel' },
  FUEL:            { color: '#F97316',             label: 'Carburant' },
  OTHER:           { color: colors.textSecondary,  label: 'Autre' },
};

// ─── Camembert dynamique ──────────────────────────────────────────────────────
function PieChart({ slices }) {
  // slices = [{ color, percent }]
  // On dessine avec des vues superposées (technique conic-gradient simulée par SVG manuel)
  // Fallback simple : 4 quadrants colorés selon les 4 premières catégories
  const top4 = slices.slice(0, 4);
  const positions = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

  return (
    <View style={styles.pie}>
      {positions.map((pos, i) => (
        <View
          key={pos}
          style={[
            styles.slice,
            styles[pos],
            { backgroundColor: top4[i]?.color || colors.muted },
          ]}
        />
      ))}
      <View style={styles.pieCenter} />
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatAmount(amount) {
  const n = Number(String(amount).replace(/[^\d]/g, ''));
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ar`;
}

function getCurrentMonthLabel() {
  return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function isSameMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isLastMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
}

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
  const { expenses, fetchExpenses } = useExpenses();

  const userName = 'Jean'; // ou récupère depuis SecureStore

  // Charge les dépenses au montage
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // ── Dépenses du mois en cours ──────────────────────────────────────────────
  const thisMonthExpenses = useMemo(
    () => expenses.filter((e) => isSameMonth(e.date)),
    [expenses]
  );

  const lastMonthExpenses = useMemo(
    () => expenses.filter((e) => isLastMonth(e.date)),
    [expenses]
  );

  // ── Total du mois ──────────────────────────────────────────────────────────
  const totalThisMonth = useMemo(
    () => thisMonthExpenses.reduce((sum, e) => sum + Number(String(e.amount).replace(/[^\d]/g, '')), 0),
    [thisMonthExpenses]
  );

  const totalLastMonth = useMemo(
    () => lastMonthExpenses.reduce((sum, e) => sum + Number(String(e.amount).replace(/[^\d]/g, '')), 0),
    [lastMonthExpenses]
  );

  const deltaPercent = useMemo(() => {
    if (totalLastMonth === 0) return null;
    const diff = ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;
    return diff.toFixed(0);
  }, [totalThisMonth, totalLastMonth]);

  // ── Répartition par catégorie (mois en cours) ─────────────────────────────
  const categoryBreakdown = useMemo(() => {
    const map = {};
    thisMonthExpenses.forEach((e) => {
      const key = e.category || 'OTHER';
      if (!map[key]) map[key] = 0;
      map[key] += Number(String(e.amount).replace(/[^\d]/g, ''));
    });

    return Object.entries(map)
      .map(([key, amount]) => ({
        key,
        label: CATEGORY_COLORS[key]?.label || key,
        color: CATEGORY_COLORS[key]?.color || colors.textSecondary,
        amount: formatAmount(amount),
        percent: totalThisMonth > 0 ? Math.round((amount / totalThisMonth) * 100) : 0,
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [thisMonthExpenses, totalThisMonth]);

  // ── Statistiques par statut ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const all = expenses; // sur toutes les dépenses, pas seulement ce mois
    return {
      submitted:    all.filter((e) => e.status === 'PENDING'  || e.status === 'SUBMITTED').length,
      approved:     all.filter((e) => e.status === 'APPROVED').length,
      rejected:     all.filter((e) => e.status === 'REJECTED').length,
      reimbursed:   all.filter((e) => e.status === 'REIMBURSED').length,
    };
  }, [expenses]);

  const dashboardStats = [
    { label: 'Soumis',         value: String(stats.submitted),  color: colors.info,    icon: 'clock-outline' },
    { label: 'Approuvé',       value: String(stats.approved),   color: colors.success, icon: 'check-circle-outline' },
    { label: 'Refusé',         value: String(stats.rejected),   color: colors.error,   icon: 'close-circle-outline' },
    { label: 'Remboursé',      value: String(stats.reimbursed), color: colors.primary, icon: 'cash-refund' },
  ];

  // ── 3 dernières dépenses ───────────────────────────────────────────────────
  const recentExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3),
    [expenses]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      {/* En-tête avec nom dynamique */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {userName} 👋</Text>
          <Text style={styles.subtitle}>
            Aperçu de {getCurrentMonthLabel()}
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="receipt-text-outline" color={colors.textPrimary} size={24} />
        </View>
      </View>

      {/* Total du mois dynamique */}
      <AppCard style={styles.totalCard} contentStyle={styles.totalContent}>
        <View>
          <Text style={styles.totalLabel}>Total ce mois</Text>
          <Text style={styles.totalAmount}>{formatAmount(totalThisMonth)}</Text>
          {deltaPercent !== null ? (
            <Text style={styles.totalDelta}>
              {Number(deltaPercent) >= 0 ? '↑' : '↓'} {Math.abs(deltaPercent)}% par rapport au mois dernier
            </Text>
          ) : (
            <Text style={styles.totalDelta}>Aucune donnée le mois dernier</Text>
          )}
        </View>
        <MaterialCommunityIcons name="chart-line" color={colors.textPrimary} size={56} />
      </AppCard>

      {/* Dépenses par catégorie dynamique */}
      <AppCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Par catégorie</Text>
          <Text style={styles.monthLabel}>
            {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
          </Text>
        </View>

        {categoryBreakdown.length === 0 ? (
          <Text style={styles.emptyText}>Aucune dépense ce mois-ci</Text>
        ) : (
          <View style={styles.categoryRow}>
            <PieChart slices={categoryBreakdown} />
            <View style={styles.legend}>
              {categoryBreakdown.slice(0, 4).map((item) => (
                <View key={item.key} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <View style={styles.legendText}>
                    <Text style={styles.legendLabel}>{item.label}</Text>
                    <Text style={styles.legendAmount}>{item.amount}</Text>
                  </View>
                  <Text style={styles.legendValue}>{item.percent}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </AppCard>

      {/* Statistiques dynamiques */}
      <View style={styles.statsGrid}>
        {dashboardStats.map((stat) => (
          <StatisticCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            icon={<MaterialCommunityIcons name={stat.icon} color={stat.color} size={18} />}
          />
        ))}
      </View>

      {/* Dernières dépenses + bouton Voir tout */}
      <AppCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dernières dépenses</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(routes.EXPENSES_LIST)}
            activeOpacity={0.7}
          >
            <Text style={styles.link}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {recentExpenses.length === 0 ? (
          <Text style={styles.emptyText}>Aucune dépense enregistrée</Text>
        ) : (
          recentExpenses.map((expense) => (
            <TouchableOpacity
              key={expense.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(routes.EXPENSE_DETAIL, { expenseId: expense.id })}
            >
              <ExpenseItem {...expense} />
            </TouchableOpacity>
          ))
        )}
      </AppCard>

    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  totalCard: {
    backgroundColor: colors.primary,
  },
  totalContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  totalAmount: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  totalDelta: {
    color: colors.textPrimary,
    fontSize: 12,
    marginTop: spacing.sm,
    opacity: 0.78,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  link: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  monthLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  categoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  pie: {
    borderRadius: 52,
    height: 104,
    overflow: 'hidden',
    position: 'relative',
    width: 104,
  },
  slice: {
    height: 52,
    position: 'absolute',
    width: 52,
  },
  topLeft:     { left: 0, top: 0 },
  topRight:    { right: 0, top: 0 },
  bottomLeft:  { bottom: 0, left: 0 },
  bottomRight: { bottom: 0, right: 0 },
  pieCenter: {
    backgroundColor: colors.white,
    borderRadius: 28,
    height: 56,
    left: 24,
    position: 'absolute',
    top: 24,
    width: 56,
  },
  legend: {
    flex: 1,
    gap: spacing.sm,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  legendDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  legendText: {
    flex: 1,
  },
  legendLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  legendAmount: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  legendValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});