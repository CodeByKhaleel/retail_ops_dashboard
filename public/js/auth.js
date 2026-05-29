const DEMO_USER = {
  uid: 'demo-user',
  email: 'demo@retailops.local',
  name: 'Demo Operator',
  photo: '',
  token: 'mock_token_for_dev',
};

function ensureDemoSession() {
  localStorage.setItem('authToken', DEMO_USER.token);
  localStorage.setItem('userEmail', DEMO_USER.email);
  localStorage.setItem('userName', DEMO_USER.name);
  localStorage.setItem('userPhoto', DEMO_USER.photo);
}

export function getCurrentUser() {
  return DEMO_USER;
}

export function clearTokenCache() {
  localStorage.removeItem('authToken');
}

export async function getAuthToken() {
  ensureDemoSession();
  return DEMO_USER.token;
}

export async function logout() {
  ensureDemoSession();
  window.location.href = '/';
}

export function initAuthListener(onAuthenticated) {
  ensureDemoSession();
  onAuthenticated(DEMO_USER);
}

export function getCachedUser() {
  ensureDemoSession();
  return {
    uid: DEMO_USER.uid,
    email: localStorage.getItem('userEmail') || DEMO_USER.email,
    name: localStorage.getItem('userName') || DEMO_USER.name,
    photo: localStorage.getItem('userPhoto') || DEMO_USER.photo,
    token: localStorage.getItem('authToken') || DEMO_USER.token,
  };
}
