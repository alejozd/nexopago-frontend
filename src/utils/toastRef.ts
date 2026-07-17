import { createRef } from 'react';
import type { Toast } from 'primereact/toast';

export const toastRef = createRef<Toast>();

export function showErrorToast(message: string): void {
  toastRef.current?.show({ severity: 'error', summary: 'Error', detail: message, life: 4000 });
}

export function showSuccessToast(message: string): void {
  toastRef.current?.show({ severity: 'success', summary: 'Éxito', detail: message, life: 3000 });
}
