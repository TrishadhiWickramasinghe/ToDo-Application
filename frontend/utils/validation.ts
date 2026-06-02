export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const validateTodoTitle = (title: string): string | null => {
  if (!title) return 'Title is required';
  if (title.length < 2) return 'Title must be at least 2 characters';
  if (title.length > 100) return 'Title must be less than 100 characters';
  return null;
};

export const validateTodoDescription = (description: string): string | null => {
  if (description.length > 500) return 'Description must be less than 500 characters';
  return null;
};
