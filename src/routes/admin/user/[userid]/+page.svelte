<script lang="ts">
	import { page } from '$app/state';
	import { error } from '@sveltejs/kit';

	let action: 'edit' | 'add';
	const querystr = page.url.search?.substring(1);
	console.log("Querystring: ", querystr);
	const queries = querystr?.split('&');
	if (queries) {
		for (const query of queries) {
			const [key, value] = query.split('=');
			if (key === 'action') {
				if (value === 'edit' || value === 'add') {
					action = value;
				}
				else {
					error(404, {
						message: 'Not found..............'
					});
				}
			}
		}
	}

	console.log(page);
</script>
<h1>User {action}</h1>