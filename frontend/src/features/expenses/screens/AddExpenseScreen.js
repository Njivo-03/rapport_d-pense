// src/features/expenses/screens/AddExpenseScreen.js
import React, { useMemo, useState } from 'react';
import {
  Alert, Modal, Platform, Pressable, ScrollView,
  StyleSheet, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { Snackbar, Text } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppCard from '../../../components/AppCard';
import AppInput from '../../../components/AppInput';
import PrimaryButton from '../../../components/PrimaryButton';
import { routes } from '../../../navigation/routes';
import { colors, spacing } from '../../../theme';
import { useExpenses } from '../contexts/ExpensesContext';

// ─── Enums alignés sur schema.prisma ─────────────────────────────────────────

const CATEGORIES = [
  { label: 'Restaurant',        value: 'RESTAURANT',      icon: 'food-fork-drink' },
  { label: 'Transport',         value: 'TRANSPORT',       icon: 'car-outline' },
  { label: 'Fourniture bureau', value: 'OFFICE_SUPPLIES', icon: 'briefcase-outline' },
  { label: 'Hôtel',             value: 'HOTEL',           icon: 'bed-outline' },
  { label: 'Carburant',         value: 'FUEL',            icon: 'gas-station-outline' },
  { label: 'Autre',             value: 'OTHER',           icon: 'receipt-text-outline' },
];

const PAYMENT_METHODS = [
  { label: 'Carte bancaire', value: 'CARD',     icon: 'credit-card-outline' },
  { label: 'Espèces',        value: 'CASH',     icon: 'cash' },
  { label: 'Mobile Money',   value: 'TRANSFER', icon: 'cellphone' },
  { label: 'Autre',          value: 'OTHER',    icon: 'dots-horizontal' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateDisplay(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toISODate(date) {
  if (!date) return new Date().toISOString();
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString();
}

function parseRawAmount(value) {
  return Number(String(value).replace(/[^\d]/g, ''));
}

function getFileName(uri) {
  return uri?.split('/').pop() || 'fichier';
}

function getFileSize(size) {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── DropdownField ────────────────────────────────────────────────────────────

function DropdownField({ label, selectedValue, options, onChange, placeholder, error }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === selectedValue);

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setVisible(true)}
        style={[styles.selectField, error && styles.selectFieldError]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.selectLabel}>{label}</Text>
          {selected ? (
            <View style={styles.selectValueRow}>
              <MaterialCommunityIcons name={selected.icon} size={16} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={styles.selectValue}>{selected.label}</Text>
            </View>
          ) : (
            <Text style={styles.selectPlaceholder}>{placeholder || 'Sélectionner'}</Text>
          )}
        </View>
        <MaterialCommunityIcons name={visible ? 'chevron-up' : 'chevron-down'} color={colors.textSecondary} size={22} />
      </TouchableOpacity>

      <Modal animationType="fade" transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={styles.dropdownSheet}>
            <Text style={styles.dropdownTitle}>{label}</Text>
            {options.map((opt) => {
              const isSelected = opt.value === selectedValue;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => { onChange(opt.value); setVisible(false); }}
                  style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                >
                  <MaterialCommunityIcons
                    name={opt.icon} size={20}
                    color={isSelected ? colors.primary : colors.textSecondary}
                    style={{ marginRight: spacing.sm }}
                  />
                  <Text style={[styles.dropdownOptionText, isSelected && styles.dropdownOptionTextSelected]}>
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <MaterialCommunityIcons name="check" size={18} color={colors.primary} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── DateField ────────────────────────────────────────────────────────────────

function DateField({ value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const dateObj = value instanceof Date ? value : new Date();

  return (
    <View>
      <TouchableOpacity activeOpacity={0.75} onPress={() => setShowPicker(true)} style={styles.selectField}>
        <View style={{ flex: 1 }}>
          <Text style={styles.selectLabel}>Date</Text>
          <Text style={styles.selectValue}>{value ? formatDateDisplay(value) : 'Sélectionner une date'}</Text>
        </View>
        <MaterialCommunityIcons name="calendar-month-outline" color={colors.textSecondary} size={22} />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          locale="fr-FR"
          maximumDate={new Date()}
          mode="date"
          onChange={(_, selected) => {
            setShowPicker(Platform.OS === 'ios');
            if (selected) onChange(selected);
          }}
          value={dateObj}
        />
      )}
    </View>
  );
}

// ─── AttachmentField ──────────────────────────────────────────────────────────

function AttachmentField({ attachment, onChange }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const requestPermission = async (type) => {
    const fn = type === 'camera'
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;
    const { status } = await fn();
    return status === 'granted';
  };

  const handleCamera = async () => {
    setMenuVisible(false);
    if (!(await requestPermission('camera'))) {
      Alert.alert('Permission refusée', "Autorisez l'accès à la caméra dans les paramètres.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      onChange({ uri: a.uri, name: getFileName(a.uri), size: a.fileSize, type: 'IMAGE' });
    }
  };

  const handleGallery = async () => {
    setMenuVisible(false);
    if (!(await requestPermission('gallery'))) {
      Alert.alert('Permission refusée', "Autorisez l'accès à la galerie dans les paramètres.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85 });
    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      onChange({ uri: a.uri, name: getFileName(a.uri), size: a.fileSize, type: 'IMAGE' });
    }
  };

  const handleDocument = async () => {
    setMenuVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]) {
        const a = result.assets[0];
        onChange({ uri: a.uri, name: a.name, size: a.size, type: 'PDF' });
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'importer le fichier.");
    }
  };

  return (
    <View>
      <Text style={styles.fieldLabel}>Justificatif</Text>
      {attachment ? (
        <View style={styles.attachment}>
          <View style={styles.attachmentThumb}>
            <MaterialCommunityIcons
              name={attachment.type === 'PDF' ? 'file-pdf-box' : 'image'}
              color={attachment.type === 'PDF' ? '#C62828' : colors.textPrimary}
              size={26}
            />
          </View>
          <View style={styles.attachmentInfo}>
            <Text style={styles.attachmentName} numberOfLines={1}>{attachment.name}</Text>
            {attachment.size ? <Text style={styles.attachmentSize}>{getFileSize(attachment.size)}</Text> : null}
          </View>
          <TouchableOpacity onPress={() => onChange(null)} hitSlop={8}>
            <MaterialCommunityIcons name="close-circle-outline" color={colors.textSecondary} size={22} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity activeOpacity={0.75} onPress={() => setMenuVisible(true)} style={styles.attachmentEmpty}>
          <MaterialCommunityIcons name="paperclip" color={colors.textSecondary} size={22} />
          <Text style={styles.attachmentEmptyText}>Ajouter un justificatif</Text>
        </TouchableOpacity>
      )}

      <Modal animationType="slide" transparent visible={menuVisible} onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.attachmentSheet}>
            <Text style={styles.dropdownTitle}>Choisir une source</Text>
            <TouchableOpacity onPress={handleCamera} style={styles.attachmentOption}>
              <View style={[styles.attachmentOptionIcon, { backgroundColor: '#E3F2FD' }]}>
                <MaterialCommunityIcons name="camera-outline" size={22} color="#1976D2" />
              </View>
              <View>
                <Text style={styles.attachmentOptionLabel}>Prendre une photo</Text>
                <Text style={styles.attachmentOptionSub}>Utiliser la caméra</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGallery} style={styles.attachmentOption}>
              <View style={[styles.attachmentOptionIcon, { backgroundColor: '#F3E5F5' }]}>
                <MaterialCommunityIcons name="image-multiple-outline" size={22} color="#7B1FA2" />
              </View>
              <View>
                <Text style={styles.attachmentOptionLabel}>Galerie</Text>
                <Text style={styles.attachmentOptionSub}>Importer depuis la galerie</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDocument} style={styles.attachmentOption}>
              <View style={[styles.attachmentOptionIcon, { backgroundColor: '#FFEBEE' }]}>
                <MaterialCommunityIcons name="file-pdf-box" size={22} color="#C62828" />
              </View>
              <View>
                <Text style={styles.attachmentOptionLabel}>Fichier PDF / Document</Text>
                <Text style={styles.attachmentOptionSub}>Importer depuis les fichiers</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function AddExpenseScreen({ navigation, route }) {
  const { createExpense, getExpenseById, updateExpense } = useExpenses();
  const [feedback, setFeedback]       = useState({ message: '', type: 'success' });
  const [category, setCategory]       = useState(null);
  const [paymentMethod, setPayment]   = useState(null);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [attachment, setAttachment]   = useState(null);
  const [formErrors, setFormErrors]   = useState({});
  const [saving, setSaving]           = useState(false);

  const expenseId = route.params?.expenseId;
  const expense   = getExpenseById(expenseId);
  const isEditing = Boolean(expenseId);

  React.useEffect(() => {
    if (isEditing && expense) {
      setCategory(expense.category || null);
      setPayment(expense.paymentMethod || null);
      if (expense.date) setExpenseDate(new Date(expense.date));
    }
  }, [isEditing, expense]);

  const defaultValues = useMemo(() => ({
    amount:      expense ? String(parseFloat(expense.amount)) : '',
    description: expense?.description || '',
    project:     expense?.project     || '',
    mission:     expense?.mission     || '',
  }), [expense]);

  const { control, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  // ── Validation dropdowns ──────────────────────────────────────────────────
  // ✅ Appelé UNE seule fois dans confirmSubmit, pas dans saveExpense
  const validateExtras = () => {
    const errs = {};
    if (!category)      errs.category      = 'Catégorie requise';
    if (!paymentMethod) errs.paymentMethod = 'Moyen de paiement requis';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Sauvegarde (appelée après confirmation Alert) ─────────────────────────
  const saveExpense = async (values) => {
    setSaving(true);
    const payload = {
      description:   values.description.trim(),
      amount:        String(parseRawAmount(values.amount)),
      date:          toISODate(expenseDate),
      category,
      paymentMethod,
      project:       values.project.trim() || undefined,
      mission:       values.mission.trim() || undefined,
      attachment:    attachment || undefined,
    };

    try {
      const result = isEditing
        ? await updateExpense(expense.id, payload)
        : await createExpense(payload);

      if (!result?.success) {
        setFeedback({ message: result?.message || "Erreur lors de l'enregistrement.", type: 'error' });
        return;
      }

      if (isEditing) {
        navigation.navigate(routes.EXPENSE_DETAIL, {
          expenseId: expense.id,
          message:   'Dépense modifiée avec succès.',
        });
      } else {
        // ✅ Snackbar visible 2s avant de quitter l'écran
        setFeedback({ message: 'Dépense enregistrée avec succès.', type: 'success' });
        setTimeout(() => navigation.goBack(), 2000);
      }
    } catch (err) {
      setFeedback({ message: 'Erreur réseau. Vérifiez votre connexion.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── Confirmation Alert avant sauvegarde ───────────────────────────────────
  const confirmSubmit = (values) => {
    // ✅ Un seul appel à validateExtras ici
    if (!validateExtras()) {
      setFeedback({ message: 'Veuillez remplir tous les champs obligatoires.', type: 'error' });
      return;
    }

    Alert.alert(
      isEditing ? 'Confirmer la modification' : "Confirmer l'enregistrement",
      isEditing ? 'Voulez-vous enregistrer les modifications ?' : 'Voulez-vous enregistrer cette dépense ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: isEditing ? 'Modifier' : 'Enregistrer', onPress: () => saveExpense(values) },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppCard contentStyle={styles.form}>
          <Text style={styles.formTitle}>
            {isEditing ? 'Modifier la dépense' : 'Nouvelle dépense'}
          </Text>

          <DateField value={expenseDate} onChange={setExpenseDate} />

          <Controller
            control={control} name="amount"
            rules={{ required: 'Montant requis', validate: (v) => parseRawAmount(v) > 0 || 'Montant invalide' }}
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput
                error={Boolean(errors.amount)}
                keyboardType="numeric"
                label="Montant (Ar)"
                onBlur={onBlur}
                onChangeText={onChange}
                right={<AppInput.Icon icon="currency-usd" />}
                value={value}
              />
            )}
          />
          {errors.amount && <Text style={styles.fieldError}>{errors.amount.message}</Text>}

          <DropdownField
            label="Catégorie" options={CATEGORIES} selectedValue={category}
            onChange={(val) => { setCategory(val); setFormErrors((e) => ({ ...e, category: undefined })); }}
            placeholder="Sélectionner une catégorie" error={Boolean(formErrors.category)}
          />
          {formErrors.category && <Text style={styles.fieldError}>{formErrors.category}</Text>}

          <DropdownField
            label="Moyen de paiement" options={PAYMENT_METHODS} selectedValue={paymentMethod}
            onChange={(val) => { setPayment(val); setFormErrors((e) => ({ ...e, paymentMethod: undefined })); }}
            placeholder="Sélectionner un moyen de paiement" error={Boolean(formErrors.paymentMethod)}
          />
          {formErrors.paymentMethod && <Text style={styles.fieldError}>{formErrors.paymentMethod}</Text>}

          <Controller
            control={control} name="description"
            rules={{ required: 'Description requise', minLength: { value: 3, message: 'Description trop courte' } }}
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput
                error={Boolean(errors.description)}
                label="Description" multiline numberOfLines={3}
                onBlur={onBlur} onChangeText={onChange} value={value}
              />
            )}
          />
          {errors.description && <Text style={styles.fieldError}>{errors.description.message}</Text>}

          <Controller
            control={control} name="project"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput label="Projet (optionnel)" onBlur={onBlur} onChangeText={onChange}
                right={<AppInput.Icon icon="briefcase-outline" />} value={value} />
            )}
          />

          <Controller
            control={control} name="mission"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput label="Mission (optionnel)" onBlur={onBlur} onChangeText={onChange}
                right={<AppInput.Icon icon="map-marker-outline" />} value={value} />
            )}
          />

          <AttachmentField attachment={attachment} onChange={setAttachment} />

          <PrimaryButton
            disabled={saving} icon="content-save-outline" loading={saving}
            onPress={handleSubmit(
              (values) => confirmSubmit(values),
              () => {
                validateExtras();
                setFeedback({ message: 'Veuillez corriger les champs en erreur.', type: 'error' });
              }
            )}
          >
            {isEditing ? 'Modifier' : 'Enregistrer'}
          </PrimaryButton>
        </AppCard>
      </ScrollView>

      <Snackbar
        duration={3500}
        onDismiss={() => setFeedback({ message: '', type: 'success' })}
        style={[styles.snackbar, feedback.type === 'error' && styles.errorSnackbar]}
        visible={Boolean(feedback.message)}
      >
        {feedback.message}
      </Snackbar>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:            { backgroundColor: colors.background, flex: 1 },
  container:         { backgroundColor: colors.background, padding: spacing.lg, paddingBottom: spacing.xxl },
  form:              { gap: spacing.sm },
  formTitle:         { color: colors.textPrimary, fontSize: 18, fontWeight: '900', marginBottom: spacing.sm, textAlign: 'center' },
  selectField:       { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 56, paddingHorizontal: spacing.md },
  selectFieldError:  { borderColor: colors.error },
  selectLabel:       { color: colors.textSecondary, fontSize: 12, marginBottom: 2 },
  selectValueRow:    { flexDirection: 'row', alignItems: 'center' },
  selectValue:       { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  selectPlaceholder: { color: colors.textSecondary, fontSize: 15, fontWeight: '400' },
  fieldLabel:        { color: colors.textPrimary, fontSize: 13, fontWeight: '800', marginBottom: spacing.sm },
  fieldError:        { color: colors.error, fontSize: 12, fontWeight: '700', marginTop: -spacing.xs },
  modalOverlay:      { backgroundColor: 'rgba(0,0,0,0.45)', flex: 1, justifyContent: 'flex-end' },
  dropdownSheet:     { backgroundColor: colors.white || '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  dropdownTitle:     { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: spacing.md },
  dropdownOption:    { alignItems: 'center', borderRadius: 10, flexDirection: 'row', marginBottom: 4, paddingHorizontal: spacing.sm, paddingVertical: 14 },
  dropdownOptionSelected:     { backgroundColor: colors.secondary || '#FFF9E6' },
  dropdownOptionText:         { color: colors.textPrimary, fontSize: 15 },
  dropdownOptionTextSelected: { color: colors.primary, fontWeight: '700' },
  attachmentSheet:       { backgroundColor: colors.white || '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  attachmentOption:      { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: spacing.md, marginBottom: 4, paddingHorizontal: spacing.sm, paddingVertical: 14 },
  attachmentOptionIcon:  { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 },
  attachmentOptionLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  attachmentOptionSub:   { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  attachment:        { alignItems: 'center', borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.sm },
  attachmentThumb:   { alignItems: 'center', backgroundColor: colors.secondary || '#FFF9E6', borderRadius: 10, height: 52, justifyContent: 'center', width: 52 },
  attachmentInfo:    { flex: 1 },
  attachmentName:    { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
  attachmentSize:    { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  attachmentEmpty:   { alignItems: 'center', borderColor: colors.border, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1.5, flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', paddingVertical: 18 },
  attachmentEmptyText: { color: colors.textSecondary, fontSize: 14 },
  snackbar:          { backgroundColor: colors.success },
  errorSnackbar:     { backgroundColor: colors.error },
});