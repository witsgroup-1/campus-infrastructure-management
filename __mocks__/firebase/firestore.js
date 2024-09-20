// __mocks__/firebase/firestore.js
export const getFirestore = jest.fn(() => ({}));

export const collection = jest.fn(() => ({
  id: 'mock-collection',
}));

export const doc = jest.fn(() => ({
  id: 'mock-doc',
  data: () => ({ field1: 'value1', field2: 'value2' }),
}));

export const getDocs = jest.fn(() =>
  Promise.resolve({
    forEach: jest.fn(callback => {
      callback({
        id: 'mock-doc-id',
        data: () => ({ field1: 'value1', field2: 'value2' }),
      });
    }),
  })
);
