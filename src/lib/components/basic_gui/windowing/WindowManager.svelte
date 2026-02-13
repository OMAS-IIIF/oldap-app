<script lang="ts">
	import Window from './Window.svelte';
	import { projectStore } from '$lib/stores/project';

	import { OldapProject } from '$lib/oldap/classes/project';
	import type { OldapUser } from '$lib/oldap/classes/user';
	import { userStore } from '$lib/stores/user';
  import type { WindowData, WindowGeometry } from '$lib/helpers/WindowData';
  import {
      closeWindow,
      createWindow,
      setActive,
      updatePos,
      updateSize,
      windowsStore
  } from '$lib/stores/windows.svelte';
  import { onMount, tick } from 'svelte';

	let { config } = $props();

	let project = $state<OldapProject | null>(null);
	let user = $state<OldapUser | null>(null);
  let windows = $state<WindowData[]>([])

  //let helloSnippet: Snippet;

	projectStore.subscribe((p: OldapProject | null) => project = p);
	userStore.subscribe((u: OldapUser | null) => user = u);
  windowsStore.subscribe((w: WindowData[]) => windows = w)

  onMount(async () => {
      await tick();
      createWindow('Hello', helloSnippet, { x: 120, y: 120, width: 300, height: 200 });
  });

	$effect(() => {
		if (project) {
			console.log('project changed', project);
		}
		if (user) {
			console.log('user changed', user);
		}
	});

</script>

{#snippet helloSnippet()}
    <div class="p-3">
        Hello World
    </div>
{/snippet}

<div class="flex flex-col h-full min-h-0">

    <!-- Desktop -->
    <div class="relative w-full flex-1 min-h-0 bg-[var(--desktop-bg,#f7f7fb)] border rounded-md overflow-hidden">
        {#each windows as w (w.windowId)}
            <Window
                title={w.windowTitle}
                windowGeometry={w.windowGeometry}
                minWidth={w.minWidth}
                minHeight={w.minHeight}
                movable={w.movable}
                resizable={w.resizable}
                closable={w.closable}
                onActivate={() => setActive(w.windowId)}
                onClose={() => closeWindow(w.windowId)}
                onMove={(p) => updatePos(w.windowId, p)}
                onResize={(g) => updateSize(w.windowId, g)}
            >
                {#snippet children()}
                    {@render w.content?.()}
                {/snippet}
            </Window>
        {/each}
    </div>
</div>