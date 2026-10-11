export type Shape = { size: number };

export const total = (shapes: Array<Shape>): number => {
  let sum = 0;

  for (const shape of shapes) {
    sum += shape.size;
  }

  return sum;
};
