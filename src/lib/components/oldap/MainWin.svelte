<script lang="ts">

import DropdownMenu from '$lib/components/basic_gui/dropdown/DropdownMenu.svelte';
import DropdownLinkItem from '$lib/components/basic_gui/dropdown/DropdownLinkItem.svelte';
import LeftHeader from '$lib/components/basic_gui/header/LeftHeader.svelte';
import ContentArea from '$lib/components/basic_gui/ContentArea.svelte';
import Header from '$lib/components/basic_gui/header/Header.svelte';
import RightHeader from '$lib/components/basic_gui/header/RightHeader.svelte';
import Footer from '$lib/components/basic_gui/footer/Footer.svelte';
import { OldapUser } from '$lib/oldap/classes/user';
import DropdownLabel from '$lib/components/basic_gui/dropdown/DropdownLabel.svelte';
import ErrorMsg from '$lib/components/oldap/ErrorMsg.svelte';
import LangSelector from '$lib/components/basic_gui/langselector/LangSelector.svelte';
import * as m from '$lib/paraglide/messages.js';
import User from '$lib/components/oldap/User.svelte';
import Projects from '$lib/components/oldap/Projects.svelte';

let { children } = $props();
let projectsIsOpen = $state(false);

let user: OldapUser | null = $state(null);

let test = (event: Event) => {
	console.log(event)
}

</script>
<div class="oldap-body">
	<Header size="text-xs lg:text-base ">
		<!-- left side of header -->
		<LeftHeader>
			<a href="/"><img src="/images/oldap-logo.svg" class="me-3 h-6 sm:h-12" alt="OLDAP Logo" /></a>
			<div>OLDAP</div>
			<a href="/about" class="hover:underline">{m.about()}</a>
		</LeftHeader>

		<!-- right side of header -->
		<RightHeader>
			<User bind:user={user} />

			<!-- language selector -->
			<LangSelector />
			<!-- project selector -->
			<!--
			<DropdownLabel bind:isOpen={projectsIsOpen} name="projects" labelText="Projects">
				<DropdownMenu bind:isOpen={projectsIsOpen} position="left" name="projects">
					<DropdownLinkItem bind:isOpen={projectsIsOpen} onclick={test} id="oldap">OLDAP</DropdownLinkItem>
				</DropdownMenu>
			</DropdownLabel>
			-->
			<Projects />

		</RightHeader>
	</Header>
	<ContentArea>
		{@render children()}
	</ContentArea>
	<Footer>
		<div>© Lukas & Manuel Rosenthaler (2025)</div>
	</Footer>
	<ErrorMsg></ErrorMsg>
</div>
