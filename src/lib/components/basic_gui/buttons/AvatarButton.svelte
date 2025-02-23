<script lang="ts">

	let { children = () => {}, isOpen = $bindable(), src = null, initials = "", onclick = null, id = null,
		innerClass = "", ariaExpanded = null, ariaHaspopup = null} = $props();

	let class_str: string = $state('')
	let avatar_error = $state(false);

	if (src) {
		class_str = "";
	}
	else if (initials) {
		class_str = "inline-flex size-10 items-center justify-center rounded-full bg-gray-500";
	}
	else {
		class_str = "inline-block size-10 overflow-hidden rounded-full bg-gray-100";
	}
	class_str += ` ${innerClass} aria-expanded=${ariaExpanded || undefined} aria-haspopup=${ariaHaspopup || undefined}`;

	const no_avatar = () => {
		console.log("NO AVATAR IMAGE", initials);
		avatar_error = true;
	}

</script>

<div class="relative inline-block text-left">
	<button class={class_str}
					onclick={onclick || undefined}>
		{#if src}
			<img {id} class="{innerClass} inline-block size-10 rounded-full" src={src} alt="" onerror={no_avatar} />
			{#if avatar_error}
				<span {id} class="{innerClass} text-medium font-medium text-white">{initials}</span>
			{/if}
		{:else if initials}
			 <span {id} class="{innerClass} text-medium font-medium text-white">{initials}</span>
		{:else}
			<svg class="{innerClass} size-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
				<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
			</svg>
		{/if}
	</button>
	{@render children()}
</div>