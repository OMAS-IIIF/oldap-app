<script>

	let {
		children,
		isOpen = $bindable(),
		title = 'MODAL DIALOG',
		ok = 'OK',
		cancel = 'CANCEL',
		okAction=async ()=>{},
		cancelAction=()=>{}
	} = $props();
	//export let isOpen = false;

	const onOk = async () => {
		const is_ok = await okAction();
		if (is_ok) {
			isOpen = false;
		}
	};

	const onCancel = () => {
		cancelAction();
		isOpen = false;
	}
</script>

<div class="modal" class:modal-open={isOpen}>
	<div class="modal-box">
		<h2 class="font-bold text-lg">{title}</h2>
		<div class="py-4">{@render children()}</div>
		<div class="modal-action flex">
			<button class="btn btn-primary" onclick={onCancel}>{cancel}</button>
			<button class="btn btn-secondary" onclick={onOk}>{ok}</button>
		</div>
	</div>
</div>
