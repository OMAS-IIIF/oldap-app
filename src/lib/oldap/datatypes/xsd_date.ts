import { OldapErrorInvalidValue } from '$lib/oldap/errors/OldapErrorInvalidValue';

/**
 * xsd:date Implementation of an xsd:date class with a lot of checks...
 */
export class XsdDate {
	#year: number;
	#month: number;
	#day: number;

	/**
	 * Constructor for a new XsdDate instance
	 *
	 * @param datestr A string in the format YYYY-MM-DD, where YYYY is the year, MM is the month (01-12) and DD is the day.
	 * @throws OldapErrorInvalidValue if the datestr is not in the correct format
	 */

	/**
	 * Constructor for a new XsdDate instance
	 *
	 * @param datestr A string in the format YYYY-MM-DD, where YYYY is the year, MM is the month (01-12) and DD is the day. Or a number for the year.
	 * @param mm The month (01-12)
	 * @param dd The day
	 * @throws OldapErrorInvalidValue if the datestr is not in the correct format
	 */
	constructor(datestr?: string | number, mm?: number, dd?: number) {
		let parts: number[];

		if ((datestr === undefined) || (datestr === '')) {
			const d = new Date();
			const yyyy = d.getFullYear();
			const mm = d.getMonth() + 1
			const dd = d.getDate()

			parts = [yyyy, mm, dd];
		}
		else if (typeof datestr === 'number' && typeof mm === 'number' && typeof dd === 'number') {
			parts = [datestr, mm, dd];
		}
		else if (typeof datestr === 'string' && !mm && !dd) {
			// Expect "YYYY-MM-DD"
			if (!datestr) throw new OldapErrorInvalidValue(`Invalid xsd:date string: "${datestr}"`);
			const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datestr);
			if (!m) throw new OldapErrorInvalidValue(`Invalid xsd:date string: "${datestr}"`);

			const year = Number(m[1]);
			const month = Number(m[2]);
			const day = Number(m[3]);

			if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
				throw new OldapErrorInvalidValue(`Invalid xsd:date string: "${datestr}"`);
			}
			if (month < 1 || month > 12) throw new OldapErrorInvalidValue(`Invalid xsd:date string: "${datestr}"`);
			if (day < 1 || day > 31) throw new OldapErrorInvalidValue(`Invalid xsd:date string: "${datestr}"`);

			// Optional: strict calendar validation (reject 2025-02-31, etc.)
			const dt = new Date(year, month - 1, day);
			if (dt.getFullYear() !== year || dt.getMonth() !== month - 1 || dt.getDate() !== day) {
				throw new OldapErrorInvalidValue(`Invalid xsd:date string: "${datestr}"`);
			}

			parts = [year, month, day];
		}
		else {
			throw new OldapErrorInvalidValue(`Invalid xsd:date string: "${datestr}"`);
		}

		if (parts.length !== 3 || parts.some(isNaN)) {
			throw new OldapErrorInvalidValue(`Invalid xsd:date string: "${datestr}"`);
		}
		const [year, month, day] = parts;
		if (month < 1 || month > 12 || day < 1 || day > 31) {
			throw new OldapErrorInvalidValue(`Invalid month/day in xsd:date: "${datestr}"`);
		}
		this.#year = year;
		this.#month = month;
		this.#day = day;
	}

	/**
	 * Returns a string representation of the date in the format YYYY-MM-DD
	 * @returns A string in the format YYYY-MM-DD, where YYYY is the year, MM is the month (01-12) and DD is the day.
	 */
	toString() {
		const yearStr = String(this.#year).padStart(4, '0');
		const monthStr = String(this.#month).padStart(2, '0');
		const dayStr = String(this.#day).padStart(2, '0');
		return `${yearStr}-${monthStr}-${dayStr}`;
	}

	/**
	 * "Automatic" conversion to string
	 * @param hint: Only string is supported
	 */
	[Symbol.toPrimitive](hint: string) {
		if (hint === "string") {
			return this.toString();
		}
		return null; // Default fallback
	}

	/**
	 * Checks if the date is equal to another date
	 *
	 * @param other
	 */
	equals(other?: XsdDate | null): boolean {
		if (!other) return false;
		return this.#year === other.#year &&
			this.#month === other.#month &&
			this.#day === other.#day;
	}

	static areEqual(a?: XsdDate | null, b?: XsdDate | null): boolean {
		if (!a && !b) { // both are empty, thus equal
			return true;
		}
		else {
			if (a) {
				return a.equals(b);
			}
			else if (b) {
				return b?.equals(a);
			}
			else {
				return false;
			}
		}
	}

	/**
	 * Returns a Date object representing the date
	 * @returns A Date object representing the date
	 */
	toDate() {
		return new Date(this.#year, this.#month - 1, this.#day);
	}

	/**
	 * Creates a new XsdDate instance from a Date object
	 * @param date A Date object
	 * @returns A new XsdDate instance
	 */
	static fromDate(date: Date): XsdDate {
		return new XsdDate(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
	}

	/**
	 * Returns the year
	 * @returns The year
	 */
	get year() {
		return this.#year;
	}

	/**
	 * Returns the month
	 * @returns The month
	 */
	get month() {
		return this.#month;
	}

	/**
	 * Returns the day
	 * @returns The day
	 */
	get day() {
		return this.#day;
	}

	clone(): XsdDate {
		return new XsdDate(this.#year, this.#month, this.#day);
	}
}