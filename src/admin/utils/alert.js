import Swal from 'sweetalert2';

export const confirmDelete = async (itemName = 'this item') => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${itemName}. This action cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#1a1a1a',
    confirmButtonText: 'Yes, delete it!',
    background: '#ffffff',
    color: '#1a1a1a'
  });
  
  return result.isConfirmed;
};

export const confirmLogout = async () => {
  const result = await Swal.fire({
    title: 'Konfirmasi Keluar',
    text: 'Apakah kamu yakin ingin mengakhiri sesi dan keluar dari Panel Admin?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Keluar System',
    cancelButtonText: 'Batal',
    background: '#ffffff',
    color: '#1a1a1a',
    reverseButtons: true
  });
  
  return result.isConfirmed;
};

export const showSuccess = (title = 'Success') => {
  Swal.fire({
    title,
    icon: 'success',
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });
};

export const showError = (title = 'Error') => {
  Swal.fire({
    title,
    icon: 'error',
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });
};
