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
    title: 'Ready to leave?',
    text: 'You are about to log out of the admin panel.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#1a1a1a',
    cancelButtonColor: '#888',
    confirmButtonText: 'Logout',
    background: '#ffffff',
    color: '#1a1a1a'
  });
  
  return result.isConfirmed;
};

export const showSuccess = (title = 'Success') => {
  Swal.fire({
    title,
    icon: 'success',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });
};
