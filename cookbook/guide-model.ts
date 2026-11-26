interface ExerciseCopy {
  readonly id: string;
  readonly title: string;
  readonly alt: string;
  readonly note: string;
  readonly lesson: string;
}

export type ExcerptSelector =
  | string // Qualified element name
  | { attribute: string; element?: string }
  | { element: string; child: string };

export interface Recipe extends ExerciseCopy {
  readonly excerpt: readonly ExcerptSelector[];
}

/** A null text token adds visual indentation without adding characters to copied XML. */
export type SourceToken = readonly [text: string, style?: string] | readonly [null, layout: string];

export interface Exercise extends ExerciseCopy {
  readonly snippet: readonly SourceToken[];
}

interface Group<T> {
  readonly name: string;
  readonly exercises: readonly T[];
}

export type RecipeGroup = Group<Recipe>;
export type GuideGroup = Group<Exercise>;
