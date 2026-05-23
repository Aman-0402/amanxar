import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

// Toast notifications (brief, auto-dismiss)
export const showSuccess = (message) => {
  toast.success(message || '✅ Success!', {
    position: 'top-right',
    autoClose: 3000,
  })
}

export const showError = (message) => {
  toast.error(message || '❌ Error!', {
    position: 'top-right',
    autoClose: 3000,
  })
}

export const showInfo = (message) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
  })
}

export const showWarning = (message) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 3000,
  })
}

// SweetAlert2 confirmations (modal, requires user action)
export const confirmDelete = async (itemName = 'this item') => {
  const result = await Swal.fire({
    title: 'Delete?',
    html: `Are you sure you want to delete <strong>${itemName}</strong>?<br><small>This action cannot be undone.</small>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
  })
  return result.isConfirmed
}

export const confirmAction = async (title, message, confirmText = 'Confirm') => {
  const result = await Swal.fire({
    title,
    html: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
  })
  return result.isConfirmed
}

export const alertSuccess = async (title, message = '') => {
  await Swal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonColor: '#10b981',
  })
}

export const alertError = async (title, message = '') => {
  await Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonColor: '#ef4444',
  })
}
