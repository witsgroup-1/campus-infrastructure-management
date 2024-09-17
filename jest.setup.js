
import fetchMock from 'jest-fetch-mock';
import '@testing-library/jest-dom'
//import '@testing-library/jest-dom'; // For extended DOM assertions



fetchMock.enableMocks();
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;


/*jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');*/


