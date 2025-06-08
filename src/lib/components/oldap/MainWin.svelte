<script lang="ts">

import LeftHeader from '$lib/components/basic_gui/header/LeftHeader.svelte';
import ContentArea from '$lib/components/basic_gui/ContentArea.svelte';
import Header from '$lib/components/basic_gui/header/Header.svelte';
import RightHeader from '$lib/components/basic_gui/header/RightHeader.svelte';
import Footer from '$lib/components/basic_gui/footer/Footer.svelte';
import { OldapUser } from '$lib/oldap/classes/user';
import ErrorMsg from '$lib/components/oldap/ErrorMsg.svelte';
import LangSelector from '$lib/components/basic_gui/langselector/LangSelector.svelte';
import * as m from '$lib/paraglide/messages.js';
import User from '$lib/components/oldap/User.svelte';
import Projects from '$lib/components/oldap/Projects.svelte';
import SuccessMsg from '$lib/components/oldap/SuccessMsg.svelte';
import { userStore } from '$lib/stores/user';
import LeftFooter from '$lib/components/basic_gui/footer/LeftFooter.svelte';
import RightFooter from '../basic_gui/footer/RightFooter.svelte';
import { BarLoader } from 'svelte-loading-spinners';
import { spinnerStore } from '$lib/stores/spinner';

let { children } = $props();

//let user: OldapUser | null = $state(null);
let user: OldapUser | null = $state($userStore);

userStore.subscribe(stored_user => {
	user = stored_user;
});

</script>


<div class="oldap-body">
	<Header size="text-xs lg:text-base ">
		<!-- left side of header -->
		<LeftHeader>
			<a href="/"><img src="/images/oldap-logo.svg" class="me-3 h-6 sm:h-12" alt="OLDAP Logo" /></a>
			<a href="/about" class="hover:underline">{m.about()}</a>
			{#if user}
				<a href="/admin" class="hover:underline">{m.admin()}</a>
			{/if}
		</LeftHeader>

		<!-- right side of header -->
		<RightHeader>
			<User bind:user={user} />

			<!-- language selector -->
			<LangSelector />

			<!-- project selector -->
			<Projects />

		</RightHeader>
	</Header>
	<ContentArea>
		{@render children()}
	</ContentArea>
	<Footer>
		<LeftFooter>
			<div>© Lukas & Manuel Rosenthaler (2025)</div>
		</LeftFooter>
		<RightFooter>
			{#if $spinnerStore !== null}
				{$spinnerStore}<BarLoader />
			{:else}
				&nbsp;
			{/if}
		</RightFooter>
	</Footer>
	<ErrorMsg></ErrorMsg>
	<SuccessMsg></SuccessMsg>
</div>


