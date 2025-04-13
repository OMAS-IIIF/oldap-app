import { convertToLanguage, Language } from '$lib/oldap/enums/language';
import { OldapErrorInvalidValue } from '$lib/oldap/errors/OldapErrorInvalidValue';

export class LangString {
	static defaultLang: Language = Language.EN
	#langstrs: Record<Language, string>;

	constructor(langstrs: Record<Language, string>) {
		this.#langstrs = langstrs;
	}

	setDefaultLanguage(defaultLanguage: Language): void {
		LangString.defaultLang = defaultLanguage;
	}

	get(lang: Language): string {
		if (this.#langstrs[lang]) {
			return this.#langstrs[lang];
		}
		if (this.#langstrs[LangString.defaultLang]) {
			return this.#langstrs[LangString.defaultLang]; // ✅ Return the default language if available
		}
		const firstAvailable = Object.values(this.#langstrs)[0]; // ✅ Get first existing language
		return firstAvailable ?? "not found"; // ❌ Return "not found" if empty
	}

	getraw(lang: Language): string | undefined {
		return this.#langstrs[lang];
	}

	set(lang: Language, value: string): void {
		this.#langstrs[lang] = value;
	}

	has(lang: Language): boolean {
		return this.#langstrs[lang] !== undefined;
	}

	keys() {
		return Object.keys(this.#langstrs);
	}

	values() {
		return Object.values(this.#langstrs);
	}

	entries(): [Language, string][] {
		return Object.entries(this.#langstrs) as [Language, string][];
	}

	forEach(callback: (value: string, key: Language) => void): void {
		for (const [key, value] of this.entries()) {
			callback(value, key);
		}
	}

	map<U>(callback: (key: Language, value: string) => U): U[] {
		return this.entries().map(([key, value]) => callback(key, value));
	}

	// Optional: make it iterable
	*[Symbol.iterator](): IterableIterator<[Language, string]> {
		for (const entry of this.entries()) {
			yield entry;
		}
	}

	toJSON(): Record<Language, string> {
		return { ...this.#langstrs };
	}

	static fromJson(jsonArray: string[] | undefined): LangString | undefined {
		if (!jsonArray) {
			return undefined
		}
		const langString: Record<Language, string> = {} as Record<Language, string>;
		jsonArray.forEach((entry) => {
			if (entry.length < 4) {
				throw new OldapErrorInvalidValue(`Invalid value for LangString: "${entry}"! Expected "text@lang".`);
			}
			const lang = entry.slice(-2);
			const text = entry.slice(0, -3);
			const langkey = convertToLanguage(lang);
			if (langkey) {
				langString[langkey as Language] = text;
			}
			else {
				throw new OldapErrorInvalidValue(`Invalid value for LangString: "${entry}"! Expected valid language.`);
			}
		});
		return new LangString(langString);
	}
}