import { defineConfig } from '@playwright/test';

export default defineConfig({
	use: { baseURL: 'http://localhost:4173' },
	webServer: {
		command: 'npm run build && npm run preview',
		env: { PUBLIC_API_URL: 'https://oldap.test', SERVER_API_URL: 'https://oldap.test' },
		port: 4173
	},

	testDir: 'e2e'
});
