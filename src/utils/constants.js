export const ACCOUNT_TYPES = [
  { value: 'checking',   label: 'Conta corrente' },
  { value: 'savings',    label: 'Poupança' },
  { value: 'credit',     label: 'Cartão de crédito' },
  { value: 'investment', label: 'Investimentos' },
  { value: 'wallet',     label: 'Carteira' },
  { value: 'benefit',    label: 'Benefício (VR, VA...)' },
]

export const CURRENCIES = [
    { value: 'BRL', label: 'Real (BRL)' },
    { value: 'USD', label: 'Dólar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'Libra (GBP)' },
    { value: 'ARS', label: 'Peso argentino (ARS)' },
]

export const ACCOUNT_COLORS = [
    '#0de238', '#11e3d5', '#e53e07', '#8902e2',
    '#2a34ff', '#e4d019', '#e61476', '#c30000',
]

export const BUSINESS_DAY_FALLBACK = [
    { value: 'before', label: 'Antecipa pro dia útil anterior' },
    { value: 'after', label: 'Posterga pro dia útil seguinte' },
]

export const DAY_RULE_TYPES = [
    { value: 'fixed', label: 'Dia fixo do mês' },
    { value: 'lastBusinessDay', label: 'Último dia útil' },
    { value: 'nthBusinessDay', label: 'Enésimo dia útil' },
    { value: 'nthWeekday', label: 'Enésimo dia da semana' },
]

export const CATEGORY_TYPES = [
  { value: 'expense', label: 'Despesa' },
  { value: 'income',  label: 'Receita' },
  { value: 'both',    label: 'Ambos' },
]

export const CATEGORY_ICONS = [
  '🏠', '🍔', '🚗', '💊', '📚', '👕',
  '💡', '📱', '🎮', '✈️', '🐾', '💰',
  '🎓', '🏋️', '🎵', '🛒', '💼', '🎁',
]

export const TRANSACTION_TYPES = [
  { value: 'expense',  label: 'Despesa' },
  { value: 'income',   label: 'Receita' },
  { value: 'transfer', label: 'Transferência' },
]

export const TRANSACTION_STATUS = [
  { value: 'pending',   label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export const PAYMENT_METHODS = [
  { value: 'debit',           label: 'Débito' },
  { value: 'credit_single',   label: 'Crédito à vista' },
  { value: 'credit_install',  label: 'Crédito parcelado' },
  { value: 'cash',            label: 'Dinheiro' },
  { value: 'pix',             label: 'Pix' },
  { value: 'transfer',        label: 'Transferência' },
]