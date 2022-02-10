/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


/**
 * @internal
 */
export type ParamDeclarationsType = Map<string, {
    order: number,
    defaultValue: string | null,
    expression: RegExp | null,
}>;
