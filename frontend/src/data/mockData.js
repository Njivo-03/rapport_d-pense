import { colors } from '../theme';

export const expenses = [
  {
    id: 'exp-1',
    title: 'Taxi Aeroport',
    date: '12/06/2024',
    time: '08:30',
    category: 'Transport',
    paymentMethod: 'Carte bancaire',
    amount: '45 000 Ar',
    description: 'Taxi pour reunion avec le client',
    project: 'Projet Alpha',
    icon: 'taxi',
  },
  {
    id: 'exp-2',
    title: 'Dejeuner client',
    date: '11/06/2024',
    time: '12:45',
    category: 'Restaurant',
    paymentMethod: 'Especes',
    amount: '75 000 Ar',
    description: 'Repas avec le partenaire commercial',
    project: 'Projet Alpha',
    icon: 'silverware-fork-knife',
  },
  {
    id: 'exp-3',
    title: 'Hotel Colbert',
    date: '10/06/2024',
    time: '19:00',
    category: 'Hotel',
    paymentMethod: 'Carte bancaire',
    amount: '300 000 Ar',
    description: 'Hebergement mission Antananarivo',
    project: 'Mission Juin',
    icon: 'bed-outline',
  },
  {
    id: 'exp-4',
    title: 'Carburant',
    date: '09/06/2024',
    time: '09:10',
    category: 'Transport',
    paymentMethod: 'Carte bancaire',
    amount: '80 000 Ar',
    description: 'Deplacement professionnel',
    project: 'Projet Beta',
    icon: 'gas-station-outline',
  },
  {
    id: 'exp-5',
    title: 'Fournitures bureau',
    date: '08/06/2024',
    time: '15:20',
    category: 'Autres',
    paymentMethod: 'Mobile Money',
    amount: '25 000 Ar',
    description: 'Papeterie et accessoires',
    project: 'Administration',
    icon: 'briefcase-outline',
  },
];

export const expenseCategories = ['Toutes', 'Transport', 'Restaurant', 'Hotel', 'Autres'];

export const categoryBreakdown = [
  { label: 'Transport', value: '35%', amount: '145 000 Ar', color: colors.primary },
  { label: 'Restaurant', value: '20%', amount: '84 000 Ar', color: colors.info },
  { label: 'Hotel', value: '30%', amount: '126 000 Ar', color: colors.warning },
  { label: 'Autres', value: '15%', amount: '65 000 Ar', color: colors.textSecondary },
];

export const dashboardStats = [
  { label: 'Soumis', value: '8', color: colors.info, icon: 'send-outline' },
  { label: 'Approuves', value: '5', color: colors.success, icon: 'check-circle-outline' },
  { label: 'Refuses', value: '2', color: colors.error, icon: 'close-circle-outline' },
  { label: 'Rembourses', value: '1', color: colors.primary, icon: 'cash-check' },
];

export const reports = [
  {
    id: 'rep-1',
    title: 'Rapport Juin 2024',
    period: '01/06/2024 - 30/06/2024',
    date: '12/06/2024',
    amount: '420 000 Ar',
    status: 'submitted',
  },
  {
    id: 'rep-2',
    title: 'Rapport Mai 2024',
    period: '01/05/2024 - 31/05/2024',
    date: '30/05/2024',
    amount: '580 000 Ar',
    status: 'approved',
  },
  {
    id: 'rep-3',
    title: 'Rapport Avril 2024',
    period: '01/04/2024 - 30/04/2024',
    date: '26/04/2024',
    amount: '310 000 Ar',
    status: 'reimbursed',
  },
  {
    id: 'rep-4',
    title: 'Rapport Mars 2024',
    period: '01/03/2024 - 31/03/2024',
    date: '25/03/2024',
    amount: '150 000 Ar',
    status: 'rejected',
  },
];

export const notifications = [
  {
    id: 'not-1',
    group: 'Aujourdhui',
    title: 'Rapport Juin 2024',
    message: 'a ete approuve',
    time: 'il y a 5 minutes',
    type: 'success',
  },
  {
    id: 'not-2',
    group: 'Aujourdhui',
    title: 'Rapport Mai 2024',
    message: 'a ete rembourse',
    time: 'il y a 1 heure',
    type: 'primary',
  },
  {
    id: 'not-3',
    group: 'Hier',
    title: 'Rapport Avril 2024',
    message: 'a ete refuse',
    time: 'hier, 16:30',
    type: 'error',
  },
  {
    id: 'not-4',
    group: 'Rappel',
    title: 'Depenses de juin',
    message: 'N oubliez pas de soumettre vos depenses',
    time: 'hier, 09:00',
    type: 'warning',
  },
];
