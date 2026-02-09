import '@testing-library/jest-dom';

// Polyfill para TextEncoder/TextDecoder en entorno Node
import { TextEncoder, TextDecoder } from 'util';
if (typeof global.TextEncoder === 'undefined') {
	global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
	global.TextDecoder = TextDecoder;
}

// Mock global para import.meta.env (Vite)
if (!global.hasOwnProperty('import')) {
	global.import = {};
}
if (!('meta' in global.import)) {
	Object.defineProperty(global.import, 'meta', {
		value: { env: {} },
		writable: true,
	});
}

// Mock global para jsPDF y HTMLCanvasElement en entorno de test
jest.mock('jspdf', () => {
	return { jsPDF: function () { return { save: jest.fn() }; } };
});

if (typeof window !== 'undefined') {
	window.HTMLCanvasElement.prototype.getContext = () => {
		return {};
	};
}
