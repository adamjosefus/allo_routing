/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


/**
 * @internal
 */
export type ParsedParamValues = Map<string, {
    readonly order: number,
    readonly value: string | null,
    readonly valid: boolean,
}>;
