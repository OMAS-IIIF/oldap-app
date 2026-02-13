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
import { getLocale } from '$lib/paraglide/runtime';
import { goto_page } from '$lib/helpers/goto_page';
import { page } from '$app/state';
import { createWindow } from '$lib/stores/windows.svelte';
import ImageUpload from '$lib/components/basic_gui/upload/ImageUpload.svelte';
import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';
import Button from '$lib/components/basic_gui/buttons/Button.svelte';
import { Upload, Plus, Search } from '@lucide/svelte';
import { OldapProject } from '$lib/oldap/classes/project';
import { projectStore } from '$lib/stores/project';
import { AdminPermission } from '$lib/oldap/enums/admin_permissions';
import InstanceEditor from '$lib/components/oldap/InstanceEditor.svelte';
import type { Snippet } from 'svelte';
import SearchInstances from '$lib/components/oldap/SearchInstances.svelte';

//type Closer = () => void;
let { children } = $props();

//let user: OldapUser | null = $state(null);
let project = $state<OldapProject | null>(null);
let user = $state<OldapUser | null>(null);
let create_resource = $state(false);
let edit_instiri = $state<string | undefined>(undefined);

userStore.subscribe(stored_user => {
	user = stored_user;
});

projectStore.subscribe(stored_project => {
	project = stored_project;
});

$effect(() => {
	if (project) {
		console.log('project changed', project);
	}
	if (user) {
		console.log('user changed', user);
	}
	create_resource = user && project &&
		(project.projectShortName.toString() !== 'oldap') &&
		(project.projectShortName.toString() !== 'shared') &&
		user?.inProject?.some(p => p.project.toString() === project?.projectIri.toString() && p.permissions.includes(AdminPermission.ADMIN_CREATE)) || false;
});


function create_my_window() {
	createWindow('Image upload', imageUpload, { x: 120, y: 120, width: 400, height: 600 });
}

function create_instance_window() {
	createWindow('Create Instance', createInstance, { x: 120, y: 120, width: 400, height: 600 });
}

function create_search_window() {
	createWindow('Search Instances', searchInstances, { x: 120, y: 120, width: 600, height: 600 });
}


</script>

{#snippet imageUpload()}
	<ImageUpload></ImageUpload>
{/snippet}

{#snippet createInstance()}
	<InstanceEditor></InstanceEditor>
{/snippet}

{#snippet searchInstances()}
	<SearchInstances></SearchInstances>
{/snippet}



<div class="oldap-body">
	<Header size="text-xs lg:text-base ">
		<!-- left side of header -->
		<LeftHeader>
			<button onclick={goto_page("/")} class="cursor-pointer"><img src="/images/oldap-logo.svg" class="me-3 h-6 sm:h-12" alt="OLDAP Logo" /></button>
			<button onclick={goto_page("/about")} class="hover:underline cursor-pointer">{m.about()}</button>
			{#if user && user.userId.toString() !== 'unknown'}
				<button onclick={goto_page("/admin")} class="hover:underline cursor-pointer">{m.admin()}</button>
			{/if}
			{#if create_resource }
				<Tooltip text="UPLOAD MEDIA FILE">
					<Button round={true} onclick={create_my_window}>
						<Upload size="16" strokeWidth="1" />
					</Button>
				</Tooltip>
				<Button round={true} onclick={create_instance_window}>
					<Plus size="16" strokeWidth="1" />
				</Button>
				<Button round={true} onclick={create_search_window}>
					<Search size="16" strokeWidth="1" />
				</Button>

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
			Path: {page.url.pathname}
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

