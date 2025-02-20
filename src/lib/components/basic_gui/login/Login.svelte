<script lang="ts">

	import * as m from '$lib/paraglide/messages.js';

	let { onsubmit, isopen = $bindable() } = $props();

	let userid = $state('');
	let password = $state('');

	let process_submit_event = (event: Event) => {
		event.preventDefault();
		isopen = false;
		onsubmit(userid, password);
		return true;
	};

</script>

<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
	<form class="space-y-6" method="POST" onsubmit={process_submit_event}>
		<div>
			<label for="userid" class="block text-sm/6 font-medium text-gray-900">{m.user_id()}</label>
			<div class="mt-2">
				<input type="text" name="userid" id="userid" bind:value={userid} autocomplete="username" required class="block w-full rounded-md bg-oldap-bg2 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
			</div>
		</div>

		<div>
			<div class="flex items-center justify-between">
				<label for="password" class="block text-sm/6 font-medium text-gray-900">{m.password()}</label>
				<div class="text-sm">
					<a href="#" tabindex="-1" class="font-semibold text-indigo-600 hover:text-indigo-500">{m.forgot_passwd()}</a>
				</div>
			</div>
			<div class="mt-2">
				<input type="password" name="password" id="password" bind:value={password} autocomplete="current-password" required class="block w-full rounded-md bg-oldap-bg2 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
			</div>
		</div>

		<div>
			<button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{m.sign_in()}</button>
		</div>
	</form>

	<p class="mt-10 text-center text-sm/6 text-gray-500">
		{m.no_reg()}
		<a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">{m.apply_for_acc()}</a>
	</p>
</div>

