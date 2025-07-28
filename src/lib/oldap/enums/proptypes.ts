
export enum PropType {
	LITERAL = 'LITERAL',
	LINK = 'LINK',
	LIST = 'LIST'
}

export function stringToPropType(value: string): PropType | undefined {
	if (value in PropType) {
		return PropType[value as keyof typeof PropType];
	}
	return undefined;
}

export function propTypeFromString(value: PropType): keyof typeof PropType | undefined {
	return Object.keys(PropType).find(
		key => PropType[key as keyof typeof PropType] === value
	) as keyof typeof PropType | undefined;
}