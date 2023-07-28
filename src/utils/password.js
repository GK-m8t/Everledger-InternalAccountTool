const generatePassword = () => {
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|\\;:\'",.<>/?';
  let newPassword = '';
  for (let i = 0; i < 10; i++) {
    newPassword += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
  }
  return newPassword;
};

export {generatePassword};
