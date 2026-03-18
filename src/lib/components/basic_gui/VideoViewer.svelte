<!--
  - Copyright (©) 2026. This software is licenced under the GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
-->

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	type VideoSource = {
		src: string;
		type?: string;
		label?: string;
	};

	type VideoTrack = {
		src: string;
		label: string;
		kind?: 'subtitles' | 'captions' | 'chapters' | 'descriptions' | 'metadata';
		srclang?: string;
		default?: boolean;
	};

	type VideoViewerProps = {
		src?: string;
		sources?: VideoSource[];
		tracks?: VideoTrack[];
		title?: string;
		poster?: string;
		token?: string | null;
		width?: string | number;
		height?: string | number;
		autoplay?: boolean;
		muted?: boolean;
		loop?: boolean;
		playsInline?: boolean;
		preload?: 'none' | 'metadata' | 'auto';
		showNativeControls?: boolean;
		showLocalControls?: boolean;
		showHotkeysHint?: boolean;
		allowPictureInPicture?: boolean;
		allowDownload?: boolean;
		startAt?: number;
		skipStep?: number;
		accentColor?: string;
	};

	type PiPVideoElement = HTMLVideoElement & {
		requestPictureInPicture?: () => Promise<unknown>;
		disablePictureInPicture?: boolean;
		webkitPresentationMode?: 'inline' | 'picture-in-picture' | 'fullscreen';
		webkitSetPresentationMode?: (mode: 'inline' | 'picture-in-picture' | 'fullscreen') => void;
		webkitEnterFullscreen?: () => void;
	};

	type PiPDocument = Document & {
		pictureInPictureEnabled?: boolean;
		pictureInPictureElement?: Element | null;
		exitPictureInPicture?: () => Promise<void>;
	};

	let {
		src,
		sources = [],
		tracks = [],
		title = 'Video Viewer',
		poster,
		token,
		width = '100%',
		height = '100%',
		autoplay = false,
		muted = false,
		loop = false,
		playsInline = true,
		preload = 'metadata',
		showNativeControls = true,
		showLocalControls = true,
		showHotkeysHint = true,
		allowPictureInPicture = true,
		allowDownload = true,
		startAt = 0,
		skipStep = 10,
		accentColor = '#4f46e5'
	}: VideoViewerProps = $props();

	let wrapperEl: HTMLDivElement | null = null;
	let videoEl: HTMLVideoElement | null = null;
	let hideControlsTimer: number | null = null;
	let lastLoadedSourceKey = $state('');

	let resolvedSources = $state<VideoSource[]>([]);
	let initError = $state<string | null>(null);
	let statusText = $state('Ready');
	let isReady = $state(false);
	let isPlaying = $state(false);
	let isMuted = $state(false);
	let volume = $state(1);
	let initializedAudioState = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let bufferedTime = $state(0);
	let playbackRate = $state(1);
	let isFullscreen = $state(false);
	let isPictureInPicture = $state(false);
	let pictureInPictureSupported = $state(false);
	let showChrome = $state(true);
	let isHovering = $state(false);
	let autoplayBlocked = $state(false);

	const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
	const effectiveMuted = $derived(initializedAudioState ? isMuted : muted);
	const effectiveVolume = $derived(initializedAudioState ? volume : muted ? 0 : 1);

	function cssSize(value: string | number): string {
		return typeof value === 'number' ? `${value}px` : value;
	}

	function appendToken(url: string): string {
		const trimmed = url.trim();
		if (!trimmed || !token || token.trim().length === 0) return trimmed;
		const separator = trimmed.includes('?') ? '&' : '?';
		return `${trimmed}${separator}token=${encodeURIComponent(token.trim())}`;
	}

	function clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}

	function formatTime(value: number): string {
		if (!Number.isFinite(value) || value < 0) return '00:00';
		const totalSeconds = Math.floor(value);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		if (hours > 0) {
			return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		}
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}

	function getBufferedEnd(): number {
		if (!videoEl || videoEl.buffered.length === 0) return 0;
		return videoEl.buffered.end(videoEl.buffered.length - 1);
	}

	function clearHideTimer() {
		if (hideControlsTimer !== null) {
			window.clearTimeout(hideControlsTimer);
			hideControlsTimer = null;
		}
	}

	function scheduleChromeHide() {
		clearHideTimer();
		if (!showLocalControls || !isPlaying || isHovering) return;
		hideControlsTimer = window.setTimeout(() => {
			showChrome = false;
		}, 2200);
	}

	function revealChrome() {
		syncPlaybackState();
		showChrome = true;
		scheduleChromeHide();
	}

	function syncPlaybackState() {
		if (!videoEl) return;
		isPlaying = !videoEl.paused && !videoEl.ended;
		if (!isPlaying) {
			showChrome = true;
			clearHideTimer();
		}
	}

	async function tryPlay() {
		if (!videoEl) return;
		try {
			await videoEl.play();
			autoplayBlocked = false;
			syncPlaybackState();
		} catch (error) {
			console.warn('Video playback was blocked', error);
			autoplayBlocked = true;
			statusText = 'Autoplay blocked by browser';
			showChrome = true;
		}
	}

	function togglePlay() {
		if (!videoEl) return;
		if (videoEl.paused || videoEl.ended) {
			void tryPlay();
			return;
		}
		videoEl.pause();
	}

	function seekTo(value: number) {
		if (!videoEl) return;
		const shouldResume = !videoEl.paused && !videoEl.ended;
		const nextValue = clamp(value, 0, Number.isFinite(duration) ? duration : value);
		videoEl.currentTime = nextValue;
		currentTime = nextValue;
		if (shouldResume) {
			void tryPlay();
		} else {
			syncPlaybackState();
		}
		revealChrome();
	}

	function skipBy(delta: number) {
		seekTo((videoEl?.currentTime || 0) + delta);
		statusText = delta >= 0 ? `Forward ${Math.abs(delta)}s` : `Back ${Math.abs(delta)}s`;
	}

	function setPlayerVolume(nextVolume: number) {
		if (!videoEl) return;
		volume = clamp(nextVolume, 0, 1);
		videoEl.volume = volume;
		isMuted = volume === 0 ? true : videoEl.muted;
		if (volume > 0 && videoEl.muted) {
			videoEl.muted = false;
		}
	}

	function toggleMute() {
		if (!videoEl) return;
		if (videoEl.muted || volume === 0) {
			videoEl.muted = false;
			if (volume === 0) {
				videoEl.volume = 0.6;
			}
		} else {
			videoEl.muted = true;
		}
	}

	function changePlaybackRate(nextRate: number) {
		if (!videoEl) return;
		playbackRate = nextRate;
		videoEl.playbackRate = nextRate;
		statusText = `${nextRate}x playback`;
		revealChrome();
	}

	function updatePictureInPictureSupport() {
		if (typeof document === 'undefined' || !allowPictureInPicture || !videoEl) {
			pictureInPictureSupported = false;
			return;
		}
		const pipDoc = document as PiPDocument;
		const pipVideo = videoEl as PiPVideoElement;
		pictureInPictureSupported = Boolean(
			(pipDoc.pictureInPictureEnabled && pipVideo.requestPictureInPicture) ||
			pipVideo.webkitSetPresentationMode
		);
	}

	async function togglePictureInPicture() {
		if (!videoEl || !allowPictureInPicture) return;
		const pipDoc = document as PiPDocument;
		const pipVideo = videoEl as PiPVideoElement;

		try {
			if (pipDoc.pictureInPictureElement === videoEl && pipDoc.exitPictureInPicture) {
				await pipDoc.exitPictureInPicture();
				isPictureInPicture = false;
				return;
			}
			if (pipDoc.pictureInPictureEnabled && pipVideo.requestPictureInPicture) {
				await pipVideo.requestPictureInPicture();
				isPictureInPicture = true;
				return;
			}
			if (pipVideo.webkitSetPresentationMode) {
				const nextMode =
					pipVideo.webkitPresentationMode === 'picture-in-picture'
						? 'inline'
						: 'picture-in-picture';
				pipVideo.webkitSetPresentationMode(nextMode);
				isPictureInPicture = nextMode === 'picture-in-picture';
			}
		} catch (error) {
			console.warn('Picture-in-Picture could not be toggled', error);
			statusText = 'Picture-in-Picture unavailable';
		}
	}

	async function toggleFullscreen() {
		if (!wrapperEl || !videoEl) return;
		const pipVideo = videoEl as PiPVideoElement;

		try {
			if (document.fullscreenElement) {
				await document.exitFullscreen();
				return;
			}
			if (wrapperEl.requestFullscreen) {
				await wrapperEl.requestFullscreen();
				return;
			}
			pipVideo.webkitEnterFullscreen?.();
		} catch (error) {
			console.warn('Fullscreen could not be toggled', error);
			statusText = 'Fullscreen unavailable';
		}
	}

	function downloadCurrentSource() {
		const currentSrc = videoEl?.currentSrc || resolvedSources[0]?.src;
		if (!currentSrc) return;
		const anchor = document.createElement('a');
		anchor.href = currentSrc;
		anchor.download = currentSrc.split('/').pop() || 'video';
		anchor.rel = 'noopener';
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	}

	function handleMetadataLoaded() {
		if (!videoEl) return;
		isReady = true;
		duration = Number.isFinite(videoEl.duration) ? videoEl.duration : 0;
		bufferedTime = getBufferedEnd();
		statusText = 'Ready';
		if (startAt > 0 && startAt < duration) {
			videoEl.currentTime = startAt;
			currentTime = startAt;
		}
		if (autoplay) {
			void tryPlay();
		}
	}

	function handleTimeUpdate() {
		if (!videoEl) return;
		currentTime = videoEl.currentTime;
		bufferedTime = getBufferedEnd();
		syncPlaybackState();
	}

	function handleProgress() {
		bufferedTime = getBufferedEnd();
	}

	function handleVolumeChange() {
		if (!videoEl) return;
		isMuted = videoEl.muted;
		volume = videoEl.volume;
		statusText =
			videoEl.muted || videoEl.volume === 0
				? 'Muted'
				: `Volume ${Math.round(videoEl.volume * 100)}%`;
	}

	function handlePlay() {
		isPlaying = true;
		statusText = 'Playing';
		revealChrome();
	}

	function handlePause() {
		isPlaying = false;
		statusText = currentTime >= duration && duration > 0 ? 'Finished' : 'Paused';
		showChrome = true;
		clearHideTimer();
	}

	function handleWaiting() {
		syncPlaybackState();
		statusText = 'Buffering...';
		showChrome = true;
	}

	function handleEnded() {
		isPlaying = false;
		showChrome = true;
		statusText = 'Finished';
		clearHideTimer();
	}

	function handleError() {
		const mediaError = videoEl?.error;
		const errorCode = mediaError?.code;
		const errorMap: Record<number, string> = {
			1: 'Video loading aborted.',
			2: 'Network error while loading video.',
			3: 'Video decoding failed.',
			4: 'Unsupported video format or source.'
		};
		initError = errorMap[errorCode || 0] || 'The video could not be loaded.';
		statusText = 'Error';
		showChrome = true;
	}

	function handleFullscreenChange() {
		isFullscreen = Boolean(document.fullscreenElement);
	}

	function handleKeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		if (target?.closest('input, select, textarea, button')) return;

		switch (event.key.toLowerCase()) {
			case ' ':
			case 'k':
				event.preventDefault();
				togglePlay();
				break;
			case 'arrowleft':
			case 'j':
				event.preventDefault();
				skipBy(-skipStep);
				break;
			case 'arrowright':
			case 'l':
				event.preventDefault();
				skipBy(skipStep);
				break;
			case 'arrowup':
				event.preventDefault();
				setPlayerVolume(volume + 0.05);
				break;
			case 'arrowdown':
				event.preventDefault();
				setPlayerVolume(volume - 0.05);
				break;
			case 'm':
				event.preventDefault();
				toggleMute();
				break;
			case 'f':
				event.preventDefault();
				void toggleFullscreen();
				break;
			case 'p':
				event.preventDefault();
				void togglePictureInPicture();
				break;
			case 'home':
				event.preventDefault();
				seekTo(0);
				break;
			case 'end':
				event.preventDefault();
				seekTo(duration);
				break;
		}
	}

	$effect(() => {
		if (initializedAudioState) return;
		isMuted = muted;
		volume = muted ? 0 : 1;
		initializedAudioState = true;
	});

	$effect(() => {
		const nextSources = [...sources];
		if (src && !nextSources.some((entry) => entry.src === src)) {
			nextSources.unshift({ src });
		}
		const nextResolvedSources = nextSources
			.map((entry) => ({
				...entry,
				src: appendToken(entry.src)
			}))
			.filter((entry) => entry.src.trim().length > 0);
		resolvedSources = nextResolvedSources;
		initError = nextResolvedSources.length === 0 ? 'Video source is required.' : null;
	});

	$effect(() => {
		if (!videoEl) return;
		videoEl.muted = isMuted;
		videoEl.volume = volume;
		videoEl.playbackRate = playbackRate;
	});

	$effect(() => {
		if (!videoEl) return;
		const handlePiPEnter = () => {
			isPictureInPicture = true;
		};
		const handlePiPLeave = () => {
			isPictureInPicture = false;
		};
		videoEl.addEventListener('enterpictureinpicture', handlePiPEnter);
		videoEl.addEventListener('leavepictureinpicture', handlePiPLeave);
		return () => {
			videoEl?.removeEventListener('enterpictureinpicture', handlePiPEnter);
			videoEl?.removeEventListener('leavepictureinpicture', handlePiPLeave);
		};
	});

	$effect(() => {
		void videoEl;
		void allowPictureInPicture;
		updatePictureInPictureSupport();
	});

	$effect(() => {
		if (!videoEl || resolvedSources.length === 0) return;
		const nextSourceKey = JSON.stringify(
			resolvedSources.map((source) => ({ src: source.src, type: source.type || '' }))
		);
		if (nextSourceKey === lastLoadedSourceKey) return;
		lastLoadedSourceKey = nextSourceKey;
		videoEl.load();
		syncPlaybackState();
		statusText = 'Source ready';
		initError = null;
	});

	onMount(() => {
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		revealChrome();
	});

	onDestroy(() => {
		document.removeEventListener('fullscreenchange', handleFullscreenChange);
		clearHideTimer();
	});

	const playedPercent = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);
	const bufferedPercent = $derived(duration > 0 ? (bufferedTime / duration) * 100 : 0);

	/*
	Usage example:
	<VideoViewer
		title="Interview"
		sources={[
			{ src: "/media/interview.mp4", type: "video/mp4" },
			{ src: "/media/interview.webm", type: "video/webm" }
		]}
		poster="/media/interview-poster.jpg"
		height={520}
	/>
	*/
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="video-viewer-shell"
	style={`width:${cssSize(width)};height:${cssSize(height)};--vv-accent:${accentColor};`}
	bind:this={wrapperEl}
	tabindex="0"
	role="application"
	aria-label={title}
	onkeydown={handleKeydown}
	onmousemove={revealChrome}
	onmouseenter={() => {
		isHovering = true;
		revealChrome();
	}}
	onmouseleave={() => {
		isHovering = false;
		scheduleChromeHide();
	}}
>
	<div class="video-stage">
		<video
			bind:this={videoEl}
			class="video-element"
			{poster}
			controls={showNativeControls}
			{autoplay}
			{loop}
			playsinline={playsInline}
			{preload}
			muted={effectiveMuted}
			onplay={handlePlay}
			onpause={handlePause}
			ontimeupdate={handleTimeUpdate}
			onloadedmetadata={handleMetadataLoaded}
			onprogress={handleProgress}
			onvolumechange={handleVolumeChange}
			onwaiting={handleWaiting}
			onplaying={() => {
				statusText = 'Playing';
				scheduleChromeHide();
			}}
			onended={handleEnded}
			onerror={handleError}
		>
			{#each resolvedSources as source (source.src)}
				<source src={source.src} type={source.type} />
			{/each}
			{#each tracks as track (`${track.kind || 'subtitles'}-${track.src}-${track.srclang || ''}`)}
				<track
					src={appendToken(track.src)}
					kind={track.kind || 'subtitles'}
					srclang={track.srclang}
					label={track.label}
					default={track.default}
				/>
			{/each}
			Your browser does not support the HTML5 video element.
		</video>

		<div class:hidden={!showChrome && isPlaying} class="video-topbar">
			<div class="video-meta">
				<div class="video-title">{title}</div>
				<div class="video-statusline">
					<span class="status-pill">{statusText}</span>
					{#if isReady}
						<span class="status-pill subtle">{playbackRate}x</span>
					{/if}
					{#if autoplayBlocked}
						<span class="status-pill warning">Click play to start</span>
					{/if}
				</div>
			</div>
		</div>

		{#if !isPlaying && !initError}
			<button type="button" class="video-center-play" onclick={togglePlay} aria-label="Play video">
				▶
			</button>
		{/if}

		{#if initError}
			<div class="video-error">
				<div class="video-error-title">Video unavailable</div>
				<div>{initError}</div>
			</div>
		{/if}
	</div>

	{#if showLocalControls}
		<div class:hidden={!showChrome && isPlaying} class="video-controls">
			<div class="timeline-row">
				<div class="timeline-track" aria-hidden="true">
					<div class="timeline-buffered" style={`width:${bufferedPercent}%;`}></div>
					<div class="timeline-played" style={`width:${playedPercent}%;`}></div>
				</div>
				<input
					type="range"
					class="timeline-input"
					min="0"
					max={Math.max(duration, 0)}
					step="0.1"
					value={currentTime}
					aria-label="Seek"
					oninput={(event) => seekTo(Number((event.currentTarget as HTMLInputElement).value))}
				/>
			</div>

			<div class="toolbar-row">
				<div class="toolbar-cluster">
					<button
						type="button"
						class="viewer-btn"
						onclick={togglePlay}
						aria-label={isPlaying ? 'Pause' : 'Play'}
					>
						{isPlaying ? '❚❚' : '▶'}
					</button>
					<button
						type="button"
						class="viewer-btn"
						onclick={() => skipBy(-skipStep)}
						aria-label={`Back ${skipStep} seconds`}
					>
						↺ {skipStep}
					</button>
					<button
						type="button"
						class="viewer-btn"
						onclick={() => skipBy(skipStep)}
						aria-label={`Forward ${skipStep} seconds`}
					>
						↻ {skipStep}
					</button>
					<div class="time-readout">{formatTime(currentTime)} / {formatTime(duration)}</div>
				</div>

				<div class="toolbar-cluster toolbar-cluster-right">
					<button
						type="button"
						class="viewer-btn"
						onclick={toggleMute}
						aria-label={effectiveMuted ? 'Unmute' : 'Mute'}
					>
						{effectiveMuted || effectiveVolume === 0 ? '🔇' : '🔊'}
					</button>
					<input
						type="range"
						class="volume-input"
						min="0"
						max="1"
						step="0.01"
						value={effectiveVolume}
						aria-label="Volume"
						oninput={(event) =>
							setPlayerVolume(Number((event.currentTarget as HTMLInputElement).value))}
					/>
					<select
						class="viewer-select"
						bind:value={playbackRate}
						aria-label="Playback speed"
						onchange={(event) =>
							changePlaybackRate(Number((event.currentTarget as HTMLSelectElement).value))}
					>
						{#each playbackRates as rate (rate)}
							<option value={rate}>{rate}x</option>
						{/each}
					</select>
					{#if pictureInPictureSupported}
						<button
							type="button"
							class="viewer-btn"
							onclick={() => void togglePictureInPicture()}
							aria-label="Toggle picture in picture"
						>
							{isPictureInPicture ? 'Inline' : 'PiP'}
						</button>
					{/if}
					<button
						type="button"
						class="viewer-btn"
						onclick={() => void toggleFullscreen()}
						aria-label="Toggle fullscreen"
					>
						{isFullscreen ? '🗗' : '⛶'}
					</button>
					{#if allowDownload}
						<button
							type="button"
							class="viewer-btn"
							onclick={downloadCurrentSource}
							aria-label="Download video"
						>
							↓
						</button>
					{/if}
				</div>
			</div>

			{#if showHotkeysHint}
				<div class="hotkeys-row">
					Shortcuts: Space/K play, J/L seek, arrows volume/seek, M mute, F fullscreen, P PiP
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.video-viewer-shell {
		position: relative;
		min-width: 220px;
		min-height: 160px;
		overflow: hidden;
		border-radius: 1rem;
		background:
			radial-gradient(circle at top, rgb(99 102 241 / 0.18), transparent 30%),
			linear-gradient(180deg, #171923 0%, #08090d 100%);
		box-shadow:
			0 16px 40px rgb(15 23 42 / 0.32),
			inset 0 0 0 1px rgb(255 255 255 / 0.08);
		color: #f8fafc;
		outline: none;
	}

	.video-stage {
		position: relative;
		height: 100%;
		background:
			radial-gradient(circle at center, rgb(255 255 255 / 0.08), transparent 55%),
			linear-gradient(180deg, rgb(15 23 42 / 0.2), rgb(2 6 23 / 0.8));
	}

	.video-element {
		display: block;
		width: 100%;
		height: 100%;
		background: #020617;
		object-fit: contain;
	}

	.video-topbar {
		position: absolute;
		inset: 0 0 auto 0;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1rem;
		background: linear-gradient(180deg, rgb(2 6 23 / 0.85), transparent);
		opacity: 1;
		transition:
			opacity 180ms ease,
			transform 180ms ease;
		pointer-events: none;
	}

	.video-topbar.hidden {
		opacity: 0;
		transform: translateY(-0.5rem);
	}

	.video-meta {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		max-width: min(100%, 34rem);
	}

	.video-title {
		font-size: 1rem;
		font-weight: 650;
		letter-spacing: 0.01em;
		text-shadow: 0 1px 2px rgb(0 0 0 / 0.5);
	}

	.video-statusline {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.18rem 0.55rem;
		border-radius: 999px;
		background: rgb(15 23 42 / 0.7);
		border: 1px solid rgb(255 255 255 / 0.14);
		backdrop-filter: blur(10px);
		font-size: 0.72rem;
	}

	.status-pill.subtle {
		color: #cbd5e1;
	}

	.status-pill.warning {
		color: #fde68a;
		border-color: rgb(250 204 21 / 0.35);
	}

	.video-center-play {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		display: grid;
		place-items: center;
		width: 4.5rem;
		height: 4.5rem;
		border: 1px solid rgb(255 255 255 / 0.18);
		border-radius: 999px;
		background: rgb(15 23 42 / 0.72);
		color: white;
		font-size: 1.65rem;
		cursor: pointer;
		backdrop-filter: blur(12px);
		box-shadow: 0 10px 24px rgb(0 0 0 / 0.3);
		transition:
			transform 180ms ease,
			background 180ms ease;
	}

	.video-center-play:hover {
		transform: translate(-50%, -50%) scale(1.04);
		background: rgb(79 70 229 / 0.82);
	}

	.video-controls {
		position: absolute;
		inset: auto 0 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		padding: 0.9rem 1rem 0.85rem;
		background: linear-gradient(180deg, transparent, rgb(2 6 23 / 0.82) 25%, rgb(2 6 23 / 0.94));
		opacity: 1;
		transition:
			opacity 180ms ease,
			transform 180ms ease;
	}

	.video-controls.hidden {
		opacity: 0;
		transform: translateY(0.75rem);
		pointer-events: none;
	}

	.timeline-row {
		position: relative;
		height: 1rem;
		display: flex;
		align-items: center;
	}

	.timeline-track {
		position: absolute;
		left: 0;
		right: 0;
		height: 0.32rem;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.14);
		overflow: hidden;
	}

	.timeline-buffered,
	.timeline-played {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		border-radius: inherit;
	}

	.timeline-buffered {
		background: rgb(255 255 255 / 0.18);
	}

	.timeline-played {
		background: var(--vv-accent);
		box-shadow: 0 0 18px color-mix(in srgb, var(--vv-accent) 55%, transparent);
	}

	.timeline-input {
		position: relative;
		width: 100%;
		margin: 0;
		background: transparent;
		appearance: none;
		cursor: pointer;
	}

	.timeline-input::-webkit-slider-runnable-track {
		height: 0.32rem;
		background: transparent;
	}

	.timeline-input::-webkit-slider-thumb {
		appearance: none;
		width: 0.9rem;
		height: 0.9rem;
		margin-top: -0.28rem;
		border-radius: 999px;
		background: white;
		border: 2px solid var(--vv-accent);
		box-shadow: 0 2px 12px rgb(15 23 42 / 0.35);
	}

	.timeline-input::-moz-range-track {
		height: 0.32rem;
		background: transparent;
	}

	.timeline-input::-moz-range-thumb {
		width: 0.9rem;
		height: 0.9rem;
		border-radius: 999px;
		background: white;
		border: 2px solid var(--vv-accent);
		box-shadow: 0 2px 12px rgb(15 23 42 / 0.35);
	}

	.toolbar-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.7rem;
	}

	.toolbar-cluster {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
	}

	.toolbar-cluster-right {
		justify-content: flex-end;
	}

	.viewer-btn,
	.viewer-select {
		border: 1px solid rgb(255 255 255 / 0.12);
		background: rgb(15 23 42 / 0.6);
		color: #e2e8f0;
		border-radius: 0.7rem;
		height: 2rem;
		padding: 0 0.7rem;
		font-size: 0.82rem;
		backdrop-filter: blur(10px);
		transition:
			background 180ms ease,
			transform 180ms ease,
			border-color 180ms ease;
	}

	.viewer-btn {
		cursor: pointer;
	}

	.viewer-btn:hover,
	.viewer-select:hover {
		background: rgb(79 70 229 / 0.32);
		border-color: rgb(255 255 255 / 0.22);
	}

	.viewer-btn:active {
		transform: translateY(1px);
	}

	.time-readout {
		padding: 0 0.35rem;
		font-variant-numeric: tabular-nums;
		font-size: 0.8rem;
		color: #cbd5e1;
	}

	.volume-input {
		width: 5.5rem;
		accent-color: var(--vv-accent);
	}

	.hotkeys-row {
		font-size: 0.72rem;
		color: #cbd5e1;
		opacity: 0.85;
	}

	.video-error {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		gap: 0.35rem;
		padding: 1.2rem;
		text-align: center;
		background: rgb(2 6 23 / 0.88);
		color: #fecaca;
	}

	.video-error-title {
		font-size: 1rem;
		font-weight: 700;
		color: #fda4af;
	}

	@media (max-width: 640px) {
		.video-controls {
			padding: 0.75rem 0.75rem 0.7rem;
		}

		.video-center-play {
			width: 3.75rem;
			height: 3.75rem;
		}

		.toolbar-row {
			flex-direction: column;
			align-items: stretch;
		}

		.toolbar-cluster,
		.toolbar-cluster-right {
			justify-content: flex-start;
		}

		.volume-input {
			width: 4rem;
		}
	}
</style>
