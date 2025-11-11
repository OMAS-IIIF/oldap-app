<script lang="ts">
	import Window from './Window.svelte';

	type Win = {
		id: string;
		title: string;
		x: number; y: number;
		width: number; height: number;
		kind: 'explorer' | 'notes' | 'dynamic';
		// optional payload for "dynamic"
		note?: string;
	};

	let counter = 0;
	let activeId = $state<string | null>(null);
	let wins = $state<Win[]>([
		{ id: `win-${++counter}`, title: 'Explorer', x: 100, y: 100, width: 420, height: 300, kind: 'explorer' },
		{ id: `win-${++counter}`, title: 'Notes',    x: 220, y: 160, width: 360, height: 260, kind: 'notes' }
	]);

	function openWindow(title = 'New Window') {
		const id = `win-${++counter}`;
		wins = [
			...wins,
			{ id, title, x: 80 + counter*12, y: 80 + counter*10, width: 420, height: 280, kind: 'dynamic', note: `Dynamic window #${counter}` }
		];
		activeId = id;
	}

	function closeWindow(id: string) {
		wins = wins.filter(w => w.id !== id);
		if (activeId === id) activeId = wins.at(-1)?.id ?? null;
	}

	function setActive(id: string) { activeId = id; }
	function updatePos(id: string, pos: { x:number; y:number }) {
		wins = wins.map(w => w.id === id ? { ...w, ...pos } : w);
	}
	function updateSize(id: string, size: { width:number; height:number }) {
		wins = wins.map(w => w.id === id ? { ...w, ...size } : w);
	}
</script>

<!-- Toolbar -->
<div class="flex items-center gap-2 p-2">
	<button class="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50" onclick={openWindow}>
		+ New window
	</button>
	{#if activeId}<span class="text-sm opacity-70">Active: {activeId}</span>{/if}
</div>

<!-- Desktop -->
<div class="relative w-full h-[70vh] bg-[var(--desktop-bg,#f7f7fb)] border rounded-md overflow-hidden">
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