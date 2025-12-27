<script lang="ts">
	import Window from './Window.svelte';
	import { Upload } from '@lucide/svelte';
	import ImageUpload from '$lib/components/basic_gui/upload/ImageUpload.svelte';
	import { authInfoStore } from '$lib/stores/authinfo';
	import { AuthInfo } from '$lib/oldap/classes/authinfo';
	import Button from '$lib/components/basic_gui/buttons/Button.svelte';
	import Textfield from '$lib/components/basic_gui/inputs/Textfield.svelte';
	import { projectStore } from '$lib/stores/project';

	import { p } from '../../../../../.svelte-kit/adapter-node/chunks/i18n';
	import { OldapProject } from '$lib/oldap/classes/project';
	import type { OldapUser } from '$lib/oldap/classes/user';
	import { userStore } from '$lib/stores/user';
	import { permission } from '$lib/paraglide/messages/it';
	import { AdminPermission } from '$lib/oldap/enums/admin_permissions';
	import Tooltip from '$lib/components/basic_gui/tooltip/Tooltip.svelte';

	let { config } = $props();

	let project = $state<OldapProject | null>(null);
	let user = $state<OldapUser | null>(null);
	let create_resource = $state<boolean>(false);

	projectStore.subscribe((p: OldapProject | null) => project = p);
	userStore.subscribe((u: OldapUser | null) => user = u);

	$effect(() => {
		if (project) {
			console.log('project changed', project);
		}
		if (user) {
			console.log('user changed', user);
		}
		create_resource = user && project && (project.projectShortName.toString() !== 'oldap') && (project.projectShortName.toString() !== 'shared') && user?.inProject?.some(p => p.project.toString() === project?.projectIri.toString() && p.permissions.includes(AdminPermission.ADMIN_CREATE)) || false;
	});

	type Win = {
		id: string;
		title: string;
		x: number; y: number;
		width: number; height: number;
		kind: 'explorer' | 'notes' | 'dynamic' | 'upload';
		// optional payload for "dynamic"
		note?: string;
	};

	let counter = 0;
	let activeId = $state<string | null>(null);
	let wins = $state<Win[]>([
		{ id: `win-${++counter}`, title: 'Explorer', x: 100, y: 100, width: 420, height: 300, kind: 'explorer' },
		{ id: `win-${++counter}`, title: 'Notes', x: 220, y: 160, width: 360, height: 260, kind: 'notes' }
	]);

	// removed unused openWindow helper

	function openUploadWindow(title = 'Upload') {
		const id = `win-${++counter}`;
		wins = [
			...wins,
			{
				id,
				title,
				x: 80 + counter * 12,
				y: 80 + counter * 10,
				width: 420,
				height: 600,
				kind: 'upload',
				note: `upload #${counter}`
			}
		];
		activeId = id;
	}

	function closeWindow(id: string) {
		wins = wins.filter(w => w.id !== id);
		if (activeId === id) activeId = wins.at(-1)?.id ?? null;
	}

	function setActive(id: string) {
		// set focused id
		activeId = id;
		// move the activated window to the end so it renders on top
		const idx = wins.findIndex(w => w.id === id);
		if (idx !== -1 && idx !== wins.length - 1) {
			const w = wins[idx];
			wins = [...wins.slice(0, idx), ...wins.slice(idx + 1), w];
		}
	}

	function updatePos(id: string, pos: { x: number; y: number }) {
		wins = wins.map(w => w.id === id ? { ...w, ...pos } : w);
	}

	function updateSize(id: string, size: { width: number; height: number }) {
		wins = wins.map(w => w.id === id ? { ...w, ...size } : w);
	}
</script>

<div class="flex flex-col h-full min-h-0">
    <!-- Toolbar -->
    <div class="flex items-center gap-2 p-2 shrink-0">
			{#if create_resource }
				<Tooltip text="UPLOAD MEDIA FILE">
					<Button round={true} onclick={() => openUploadWindow('UPLOAD')}>
						<Upload size="16" strokeWidth="1" />
					</Button>
				</Tooltip>
			{/if}
        {#if activeId}<span class="text-sm opacity-70">Active: {activeId}</span>{/if}
    </div>

    <!-- Desktop -->
    <div class="relative w-full flex-1 min-h-0 bg-[var(--desktop-bg,#f7f7fb)] border rounded-md overflow-hidden">
        {#each wins as w (w.id)}
            <Window
                title={w.title}
                x={w.x} y={w.y} width={w.width} height={w.height}
                onActivate={() => setActive(w.id)}
                onClose={() => closeWindow(w.id)}
                onMove={(p) => updatePos(w.id, p)}
                onResize={(s) => updateSize(w.id, s)}
            >
                {#snippet children()}
                    {#if w.kind === 'explorer'}
                        <div class="p-3">
                            <h3 class="font-semibold mb-2">Explorer</h3>
                            <p class="text-sm opacity-80">This is the first window.</p>
                        </div>
                    {:else if w.kind === 'notes'}
                        <div class="p-3">
                            <h3 class="font-semibold mb-2">Notes</h3>
                            <ul class="list-disc pl-5 text-sm space-y-1">
                                <li>Drag by title bar</li>
                                <li>Resize from corners</li>
                                <li>Click to focus</li>
                            </ul>
                        </div>
                    {:else if w.kind === 'upload'}
                        <div class="p-3">
                            <ImageUpload uploadUrl={config.uploadUrl} />
                        </div>
                    {:else} <!-- dynamic -->
                        <div class="p-3">
                            <h3 class="font-semibold">{w.title}</h3>
                            <p class="text-sm opacity-80">{w.note}</p>
                        </div>
                    {/if}
                {/snippet}
            </Window>
        {/each}
    </div>
</div>