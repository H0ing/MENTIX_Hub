const CURRENT_LOGIN_KEY = 'current_login';

export function setCurrentLogin(userData) {
  try {
    localStorage.setItem(CURRENT_LOGIN_KEY, JSON.stringify(userData));
  } catch (err) {
    console.error('Failed to save login info to localStorage', err);
  }
}

export function getCurrentLogin() {
  try {
    const data = localStorage.getItem(CURRENT_LOGIN_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to read login info from localStorage', err);
    return null;
  }
}

export function removeCurrentLogin() {
  try {
    localStorage.removeItem(CURRENT_LOGIN_KEY);
  } catch (err) {
    console.error('Failed to remove login info from localStorage', err);
  }
}
