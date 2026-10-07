import crypto from 'crypto';

export const generateBookingId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate random 6 character alphanumeric string
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  
  return `MOV-${year}${month}${day}-${randomStr}`;
};
