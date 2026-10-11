var legacy = 1;
const unused = 'x';

export const text: any = "double quoted";

interface Shape {
  size: number;
}

export function run(items: string[]): void {
  items.forEach(item => console.log(item));
  if (items.length) return;
  Promise.resolve(legacy);
}

export const isList = (value: unknown) => value instanceof Array;
