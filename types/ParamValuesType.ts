/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


/**
 * @internal
 */
export type ParamValuesType = Map<string, {
    readonly order: number,
    readonly value: string | null,
    readonly valid: boolean,
}>;
