/**
 * Formats a number to Spanish Euro currency format: 1.845,25 €
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0,00 €';
  
  const formatted = amount.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${formatted} €`;
}

/**
 * Builds a direct wa.me link with encoded text message
 */
export function getWhatsAppUrl(phone: string, text: string): string {
  // Clean phone to only digits
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Generates sequential quote reference code PR-2025-XXX
 */
export function generateQuoteRef(existingCount: number): string {
  const num = (43 + existingCount).toString().padStart(3, '0');
  return `PR-2025-${num}`;
}
