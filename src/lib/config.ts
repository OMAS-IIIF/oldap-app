/*
 * Copyright (©) 2025. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
 */

export async function testConfig() {
	const res = await fetch('/config.json');
	if (!res.ok) {
		throw new Error(`Failed to fetch config.json: ${res.status}`);
	}
	const data = await res.json();
	console.log('Loaded config.json:', data);
	return data;
}