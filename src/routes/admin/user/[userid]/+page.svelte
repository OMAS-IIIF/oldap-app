<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let title = data.action === 'edit' ? "Edit user" : "Create user";

</script>

<h1>{title} "{data.userid}"</h1>
<form>
	<div>
		<label for="userid">User ID</label>
		<input name="useif" id="userid">
	</div>

	<div>
		<label for="familyname">Family name</label>
		<input name="familyname" id="familyname">
	</div>
	<div>
		<label for="givenname">Given name</label>
		<input name="givenname" id="givenname">
	</div>
	<div>
		<label for="email">Email</label>
		<input name="email" id="enail">
	</div>

</form>