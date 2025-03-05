<script lang="ts">
	/**
	 * A svelte PageServer that implements the header of a website. It's attached to the top
	 * of the main window and expands from the left to the right. The &lt;Header&gt; allows &lt;HeaderLeft&gt;
	 * and &lt;HeaderRight&rg; components. The &lt;HeaderLeft&gt; fills from the left border, the &lt;HeaderRight&gt;
	 * from the right border
	 * @PageServer
	 *
	 * @param children: Must be a <HeaderLeft> or <HeaderRight> (or both) PageServer.
	 * @param size: May be "xs", "sm", "base", "lg", "xl", "2xl", ..., "9xl", "[value]" or a custom value.
	 *              Applies to text inside the children elements.
	 */
	let { children, size = ''} = $props();


</script>

<div class="oldap-header {size}">
	{@render children()}
</div>
