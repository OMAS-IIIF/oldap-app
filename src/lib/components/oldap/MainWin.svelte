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
	import { goto_page } from '$lib/helpers/goto_page';
	import { page } from '$app/state';
	import { createWindow } from '$lib/stores/windows.js';
	import ImageUpload from '$lib/components/basic_gui/upload/ImageUpload.svelte';
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import { Upload, Plus, Search, List } from '@lucide/svelte';
	import { OldapProject } from '$lib/oldap/classes/project';
	import { projectStore } from '$lib/stores/project';
	import { AdminPermission } from '$lib/oldap/enums/admin_permissions';
	import InstanceEditor from '$lib/components/oldap/InstanceEditor.svelte';
	import type { DatamodelClass } from '$lib/oldap/classes/datamodel';
	import { datamodelStore } from '$lib/stores/datamodel';
	import AllInstancesOf from '$lib/components/oldap/AllInstancesOf.svelte';

	//type Closer = () => void;
	let { children } = $props();

	//let user: OldapUser | null = $state(null);
	let project = $state<OldapProject | null>(null);
	let user = $state<OldapUser | null>(null);
	let datamodel = $state<DatamodelClass | null>(null);
	let create_resource = $state(false);
	let searchText = $state('');
	let searchResourceClasses = $state<string[]>([]);
	let selectedSearchResourceClass = $state('');

	userStore.subscribe((stored_user) => {
		user = stored_user;
	});

	projectStore.subscribe((stored_project) => {
		project = stored_project;
	});

	datamodelStore.subscribe((stored_datamodel) => {
		datamodel = stored_datamodel;
	});

	$effect(() => {
		if (project) {
			console.log('project changed', project);
		}
		if (user) {
			console.log('user changed', user);
		}
		create_resource =
			(user &&
				project &&
				project.projectShortName.toString() !== 'oldap' &&
				project.projectShortName.toString() !== 'shared' &&
				user?.inProject?.some(
					(p) =>
						p.project.toString() === project?.projectIri.toString() &&
						p.permissions.includes(AdminPermission.ADMIN_CREATE)
				)) ||
			false;
	});

	$effect(() => {
		const resourceClasses = project
			? datamodel?.resources
					.filter((resource) => {
						const superclasses = resource.superclass
							? [...resource.superclass].map((superclass) => superclass.toString())
							: [];
						return !superclasses.includes('oldap:OldapListNode');
					})
					.map((resource) => resource.iri.toString()) || []
			: [];

		searchResourceClasses = resourceClasses;
		if (resourceClasses.length === 0) {
			selectedSearchResourceClass = '';
			return;
		}
		if (!resourceClasses.includes(selectedSearchResourceClass)) {
			selectedSearchResourceClass = resourceClasses[0];
		}
	});

	function create_upload_window() {
		createWindow('Image upload', imageUpload, [], { x: 80, y: 20, width: 500, height: 650 });
	}

	function create_instance_window() {
		createWindow('Create Instance', createInstance, [], {
			x: 120,
			y: 120,
			width: 400,
			height: 600
		});
	}

	function create_listinstances_window() {
		createWindow('List Instances', listInstances, [], { x: 120, y: 120, width: 600, height: 600 });
	}

	function create_search_window(searchString: string, resourceClass: string) {
		void searchString;
		void resourceClass;
		// TODO
	}
</script>

{#snippet imageUpload()}
	<ImageUpload></ImageUpload>
{/snippet}

{#snippet createInstance()}
	<InstanceEditor></InstanceEditor>
{/snippet}

{#snippet listInstances()}
	<AllInstancesOf></AllInstancesOf>
{/snippet}

<div class="oldap-body">
	<Header size="text-xs lg:text-base ">
		<!-- left side of header -->
		<LeftHeader>
			<button onclick={goto_page('/')} class="cursor-pointer"
				><img src="/images/oldap-logo.svg" class="me-3 h-6 sm:h-12" alt="OLDAP Logo" /></button
			>
			<button onclick={goto_page('/about')} class="cursor-pointer hover:underline"
				>{m.about()}</button
			>
			{#if user && user.userId.toString() !== 'unknown'}
				<button onclick={goto_page('/admin')} class="cursor-pointer hover:underline"
					>{m.admin()}</button
				>
			{/if}
			{#if create_resource}
				<Tooltip text="UPLOAD MEDIA FILE">
					<Button round={true} onclick={create_upload_window}>
						<Upload size="16" strokeWidth="1" />
					</Button>
				</Tooltip>
				<Button round={true} onclick={create_instance_window}>
					<Plus size="16" strokeWidth="1" />
				</Button>
				<Button round={true} onclick={create_listinstances_window}>
					<List size="16" strokeWidth="1" />
				</Button>
			{/if}
			{#if project && searchResourceClasses.length > 0}
				<div class="ml-2 flex min-w-0 items-center gap-2">
					<select
						bind:value={selectedSearchResourceClass}
						class="text-oldap-fg focus:border-oldap-focus dark:bg-oldap-bg2-dark dark:text-oldap-fg-dark h-8 w-40 max-w-44 rounded-md border border-indigo-500/40 bg-white/90 px-2 text-xs outline-none sm:w-48"
						title="Resource class"
					>
						{#each searchResourceClasses as resourceClass (resourceClass)}
							<option value={resourceClass}>{resourceClass}</option>
						{/each}
					</select>
					<input
						type="text"
						bind:value={searchText}
						class="text-oldap-fg focus:border-oldap-focus dark:bg-oldap-bg2-dark dark:text-oldap-fg-dark h-8 w-40 min-w-0 rounded-md border border-indigo-500/40 bg-white/90 px-3 text-xs outline-none placeholder:text-sky-700 sm:w-56 dark:placeholder:text-sky-300"
						placeholder="Search text"
						onkeydown={(event) => {
							if (event.key === 'Enter') {
								event.preventDefault();
								create_search_window(searchText.trim(), selectedSearchResourceClass);
							}
						}}
					/>
					<Tooltip text="SEARCH">
						<Button
							round={true}
							onclick={() => create_search_window(searchText.trim(), selectedSearchResourceClass)}
						>
							<Search size="16" strokeWidth="1" />
						</Button>
					</Tooltip>
				</div>
			{/if}
		</LeftHeader>

		<!-- right side of header -->
		<RightHeader>
			<User bind:user />

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
			<div>© Lukas & Manuel Rosenthaler (2025, 2026)</div>
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
