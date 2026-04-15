
/**
 * xsd:date Implementation of an xsd:date class with a lot of checks...
 */
export class XsdDate {
	#ts_date: Date;

	/**
	 * Constructor for a new XsdDate instance
	 *
	 * @param datestr A string in the format YYYY-MM-DD, where YYYY is the year, MM is the month (01-12) and DD is the day.
	 * @throws OldapErrorInvalidValue if the datestr is not in the correct format
	 */

	parseDateYYYYMMDD(s: string): Date {
		const [y, m, d] = s.split("-").map(Number);
		const date = new Date(y, m - 1, d);

		if (
			date.getFullYear() !== y ||
			date.getMonth() !== m - 1 ||
			date.getDate() !== d
		) {
			console.log("Y:", date.getFullYear(), y);
			console.log('Y:', date.getMonth(), m - 1);
			console.log('Y:', date.getDate(), d);
			throw new Error(`Invalid date: ${s}`);
		}

		return date;
	}

	formatDateYYYYMMDD(date: Date): string {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");

		return `${y}-${m}-${d}`;
	}

	/**
	 * Constructor for a new XsdDate instance
	 *
	 * @param datestr A string in the format YYYY-MM-DD, where YYYY is the year, MM is the month (01-12) and DD is the day. Or a number for the year.
	 * @param mm The month (01-12)
	 * @param dd The day
	 * @throws OldapErrorInvalidValue if the datestr is not in the correct format
	 */
	constructor(datestr?: Date | string | number, mm?: number, dd?: number) {

		if (datestr instanceof Date) {
			this.#ts_date = datestr;
		}
		else if (typeof datestr === "string") {
			this.#ts_date = this.parseDateYYYYMMDD(datestr);
		}
		else if (typeof datestr === 'number' && typeof mm === 'number' && typeof dd === 'number') {
			this.#ts_date = new Date(datestr, mm - 1, dd);
		}
		else {
			this.#ts_date = new Date();
		}
	}

	/**
	 * Returns a string representation of the date in the format YYYY-MM-DD
	 * @returns A string in the format YYYY-MM-DD, where YYYY is the year, MM is the month (01-12) and DD is the day.
	 */
	toString() {
		return this.formatDateYYYYMMDD(this.#ts_date);
	}

	toApi() {
		return this.toString();
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
		return this.#ts_date === other.#ts_date;
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
		return this.#ts_date;
	}


	/**
	 * Returns the year
	 * @returns The year
	 */
	get year() {
		return this.#ts_date.getFullYear();
	}

	/**
	 * Returns the month
	 * @returns The month
	 */
	get month() {
		return this.#ts_date.getMonth() + 1;
	}

	/**
	 * Returns the day
	 * @returns The day
	 */
	get day() {
		return this.#ts_date.getDay();
	}

	clone(): XsdDate {
		return new XsdDate(this.#ts_date);
	}
}