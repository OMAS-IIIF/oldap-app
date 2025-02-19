import { convertToLanguage, Language } from '$lib/oldap/enums/language';
import { OldapErrorInvalidValue } from '$lib/oldap/errors/OldapErrorInvalidValue';

export type LangString = Record<Language, string>;

export function jsonToLangString(jsonArray: string[] | undefined): LangString | undefined {
	if (!jsonArray) {
		return undefined
	}
	const langString: Partial<LangString> = {};
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
	return langString as LangString;
}

export function getLangString(
	langString: LangString,
	lang: Language,
	defaultLang: Language = Language.EN
): string {
	if (langString[lang]) {
		return langString[lang]; // ✅ Return the requested language if available
	}

	if (langString[defaultLang]) {
		return langString[defaultLang]; // ✅ Return the default language if available
	}

	const firstAvailable = Object.values(langString)[0]; // ✅ Get first existing language
	return firstAvailable ?? "not found"; // ❌ Return "not found" if empty
}
