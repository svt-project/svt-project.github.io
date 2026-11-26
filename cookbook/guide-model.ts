interface ExerciseCopy {
  readonly id: string;
  readonly title: string;
  readonly alt: string;
  readonly note: string;
  readonly lesson: string;
  readonly editable?: boolean;
  /** Image slots driven by a single comparison control. */
  readonly linkedImages?: readonly string[];
}

export interface Recipe extends ExerciseCopy {
  readonly lines: readonly string[];
}

export type SourceToken = readonly [text: string, style?: string];

export interface Exercise extends ExerciseCopy {
  readonly snippet: readonly SourceToken[];
}

interface Group<T> {
  readonly name: string;
  readonly exercises: readonly T[];
}

export type RecipeGroup = Group<Recipe>;
export type GuideGroup = Group<Exercise>;
