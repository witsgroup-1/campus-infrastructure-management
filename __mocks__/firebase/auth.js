// __mocks__/firebase/auth.js
export const getAuth = jest.fn(() => ({}));

export const onAuthStateChanged = jest.fn((auth, callback) => {
  const user = { uid: 'test-uid', email: 'test@example.com' }; // Mock user
  callback(user);
});


