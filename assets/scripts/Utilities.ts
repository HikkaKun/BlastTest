export function randomEnumKey<T extends object>(anEnum: T, limitTo?: number): T[keyof T] {
	const values = Object.keys(anEnum)
		.map(n => Number.parseInt(n))
		.filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
	const index = Math.floor(Math.random() * (limitTo ?? values.length))

	return values[index];
}

export type EnumType<T> = T[keyof T];

export function shuffleArray(array: Array<unknown>) {
	let currentIndex = array.length, randomIndex;

	while (currentIndex != 0) {

		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}