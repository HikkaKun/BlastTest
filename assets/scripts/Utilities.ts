export function randomEnumKey<T extends object>(anEnum: T, limitTo?: number): T[keyof T] {
	const values = Object.keys(anEnum)
		.map(n => Number.parseInt(n))
		.filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
	const index = Math.floor(Math.random() * (limitTo ?? values.length))

	return values[index];
}

export type EnumType<T> = T[keyof T];

