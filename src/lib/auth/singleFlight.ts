/**
 * Coordinate concurrent calls so every caller observes the same in-flight result.
 * A completed or failed call releases the slot for the next operation.
 */
export class SingleFlight<T> {
	private pending: Promise<T> | null = null;

	run(operation: () => Promise<T>): Promise<T> {
		if (this.pending) return this.pending;

		this.pending = operation().finally(() => {
			this.pending = null;
		});
		return this.pending;
	}
}
