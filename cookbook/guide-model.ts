interface ExerciseCopy {
  readonly id: string;
  readonly title: string;
  readonly alt: string;
  readonly note: string;
  readonly lesson: string;
}

export interface Recipe extends ExerciseCopy {
  readonly lines: readonly string[];
}

export interface Exercise extends ExerciseCopy {
  readonly snippet: string;
}

interface Group<T> {
  readonly name: string;
  readonly exercises: readonly T[];
}

export type RecipeGroup = Group<Recipe>;
export type GuideGroup = Group<Exercise>;
