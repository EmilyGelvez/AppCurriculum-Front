export const limpiarSesion = () => { 
  localStorage.removeItem('orinoco_token');
  localStorage.removeItem('orinoco_user');
  localStorage.removeItem('last_activity');
};