/**
 * xsd:dateTime Implementation of an xsd:dateTime class with a lot of checks...
 */
export class XsdDateTime {
	#ts_datetime: Date;

	/**
	 * Parses a string representation of a datetime.
	 *
	 * @param s A string in a valid xsd:dateTime / ISO 8601 compatible format.
	 * @throws Error if the datetime string cannot be parsed.
	 */
	parseDateTime(s: string): Date {
		const datetime = new Date(s);

		if (Number.isNaN(datetime.getTime())) {
			throw new Error(`Invalid datetime: ${s}`);
		}

		return datetime;
	}

	formatDateTime(date: Date): string {
		return date.toISOString();
	}

	/**
	 * Constructor for a new XsdDateTime instance
	 *
	 * @param datetimestr A valid xsd:dateTime / ISO 8601 string. Or a number for the year.
	 * @param mm The month (01-12)
	 * @param dd The day
	 * @param hh The hour
	 * @param min The minute
	 * @param sec The second
	 * @throws Error if the datetimestr is not in the correct format
	 */
	constructor(
		datetimestr?: Date | string | number,
		mm?: number,
		dd?: number,
		hh?: number,
		min?: number,
		sec?: number
	) {
		if (datetimestr instanceof Date) {
			this.#ts_datetime = datetimestr;
		} else if (typeof datetimestr === 'string') {
			this.#ts_datetime = this.parseDateTime(datetimestr);
		} else if (
			typeof datetimestr === 'number' &&
			typeof mm === 'number' &&
			typeof dd === 'number'
		) {
			this.#ts_datetime = new Date(datetimestr, mm - 1, dd, hh ?? 0, min ?? 0, sec ?? 0);
		} else {
			this.#ts_datetime = new Date();
		}
	}

	/**
	 * Returns a string representation of the datetime in ISO 8601 format
	 * @returns A string representation of the datetime.
	 */
	toString() {
		return this.formatDateTime(this.#ts_datetime);
	}

	toApi() {
		return this.toString();
	}

	/**
	 * "Automatic" conversion to string
	 * @param hint: Only string is supported
	 */
	[Symbol.toPrimitive](hint: string) {
		if (hint === 'string') {
			return this.toString();
		}
		return null; // Default fallback
	}

	/**
	 * Checks if the datetime is equal to another datetime
	 *
	 * @param other
	 */
	equals(other?: XsdDateTime | null): boolean {
		if (!other) return false;
		return this.#ts_datetime === other.#ts_datetime;
	}

	static areEqual(a?: XsdDateTime | null, b?: XsdDateTime | null): boolean {
		if (!a && !b) {
			// both are empty, thus equal
			return true;
		} else {
			if (a) {
				return a.equals(b);
			} else if (b) {
				return b?.equals(a);
			} else {
				return false;
			}
		}
	}

	/**
	 * Returns a Date object representing the datetime
	 * @returns A Date object representing the datetime
	 */
	toDate() {
		return this.#ts_datetime;
	}

	/**
	 * Returns the year
	 * @returns The year
	 */
	get year() {
		return this.#ts_datetime.getFullYear();
	}

	/**
	 * Returns the month
	 * @returns The month
	 */
	get month() {
		return this.#ts_datetime.getMonth() + 1;
	}

	/**
	 * Returns the day
	 * @returns The day
	 */
	get day() {
		return this.#ts_datetime.getDate();
	}

	/**
	 * Returns the hour
	 * @returns The hour
	 */
	get hour() {
		return this.#ts_datetime.getHours();
	}

	/**
	 * Returns the minute
	 * @returns The minute
	 */
	get minute() {
		return this.#ts_datetime.getMinutes();
	}

	/**
	 * Returns the second
	 * @returns The second
	 */
	get second() {
		return this.#ts_datetime.getSeconds();
	}

	clone(): XsdDateTime {
		return new XsdDateTime(this.#ts_datetime);
	}
}
