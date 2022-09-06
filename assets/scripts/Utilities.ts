export function randomEnumKey<T>(anEnum: T): T[keyof T] {
	const values = (Object.values(anEnum) as unknown) as T[keyof T][];
	const index = Math.floor(Math.random() * values.length);

	return values[index];
}