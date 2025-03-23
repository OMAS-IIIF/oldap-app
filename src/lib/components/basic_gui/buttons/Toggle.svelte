<!--
@PageServer

#Confirmation

This PageServer opens a confirmation dialog...
-->
<script lang="ts">

	let { toggle_state = $bindable(), onclick = undefined, id = undefined, class: userClass = "" }: { toggle_state: boolean, onclick: ((on: boolean, id: string) => Promise<boolean>) | undefined, id?: string | undefined, class?: string  } = $props()

	let clicked = async () => {

		if (onclick) {
			toggle_state = await onclick(toggle_state, id || '');
		}
		else {
			toggle_state = !toggle_state
		}
	}

</script>

<button type="button"
				{id}
				class="group relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-hidden {userClass}"
				role="switch"
				aria-checked="false"
				onclick={clicked}>
	<span class="sr-only">Use setting</span>
	<span aria-hidden="true" class="pointer-events-none absolute size-full rounded-md bg-white dark:bg-gray-800"></span>
	<!-- Enabled: "bg-indigo-600", Not Enabled: "bg-gray-200" -->
	<span aria-hidden="true"
				class="pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out {toggle_state ? 'bg-toggle-state-on dark:bg-toggle-state-on-dark' : 'bg-toggle-state-off dark:bg-toggle-state-off-dark'}></span>'}">
	</span>
	<!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" -->
	<span aria-hidden="true" class="pointer-events-none absolute left-0 inline-block size-5 translate-x-0 transform rounded-full border border-toggle-lever-border dark:toggle-lever-border-dark bg-toggle-lever dark:bg-toggle-lever-dark ring-0 shadow-sm transition-transform duration-200 ease-in-out {toggle_state ? 'translate-x-5' : 'translate-x-0'}"></span>
</button>