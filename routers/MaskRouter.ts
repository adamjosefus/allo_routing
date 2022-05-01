/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


import { Cache } from "https://deno.land/x/allo_caching@v1.2.0/mod.ts";
import { type IRouter } from "../types/IRouter.ts";
import { Router } from "./Router.ts";
import { type ServeResponseType } from "../types/ServeResponseType.ts";
import { type RouterOptions, createRequiredOptions } from "../helpers/RouterOptions.ts";
import { type ParamDeclarationsType } from "../types/ParamDeclarationsType.ts";
import { type ParamValuesType } from "../types/ParamValuesType.ts";
import { RouterMalformedException } from "./RouterMalformedException.ts";


/**
 * Class `MaskRouter` is a router that mathing url by mask.
 * 
 * Some part of the mask can be optional. This part is closed to `[` and `]`.
 * 
 * Mask may contains parameters.
 * Parameter is defined by `<` and `>` symbols.
 * In the parameter you can specific the default value. `<param=default>`
 * Also you can define regular expression for value validation.`<param=default regexp>`
 * 
 * Examples:
 *   - `product[/detail]`
 *   - `[product[/detail]]`
 *   - `product/<id>`
 *   - `page/<id=123 \\d+>`
 * 
 */
export class MaskRouter extends Router implements IRouter {

    readonly #mask: string;
    readonly #maskVariants: readonly string[];
    readonly #serveResponse: ServeResponseType;
    readonly #options: Required<RouterOptions>;

    readonly #varibleOpenChar = '[';
    readonly #varibleCloseChar = ']';
    readonly #maskParser = /\<(?<name>[a-z][A-z0-9]*)(=(?<defaultValue>.+?))?\s*(\s+(?<expression>.+?))?\>/g;

    readonly #maskCache = new Cache<string>();
    readonly #variantCache = new Cache<string[]>();
    readonly #matchCache = new Cache<boolean>();
    readonly #paramParserCache = new Cache<RegExp>();
    readonly #paramDeclarationCache = new Cache<ParamDeclarationsType>();
    readonly #paramValuesCache = new Cache<ParamValuesType | null>();


    constructor(mask: string, serveResponse: ServeResponseType, options?: RouterOptions) {
        super();

        this.#mask = this.#parseMask(mask);
        this.#maskVariants = this.#parseVariants(mask);
        this.#serveResponse = serveResponse;
        this.#options = createRequiredOptions(options);
    }


    match(req: Request): boolean {
        const pathname = this.#computePathname(req);

        return this.#match(pathname)
    }


    async serveResponse(req: Request): Promise<Response> {
        const pathname = this.#computePathname(req);

        const matchedMask = this.#getMatchedMask(pathname);
        if (matchedMask === null || !this.#match(pathname)) throw new Error("No mask matched");

        const params: Record<string, string> = {};
        const paramValues = this.#parseParamValues(this.#mask, matchedMask, pathname);

        if (paramValues === null) {
            throw new Error("No param values parsed");
        }

        for (const [name, { value }] of paramValues) {
            if (value === null) continue;

            params[name] = value;
        }

        return await this.#serveResponse(req, params);
    }


    #match(pathname: string): boolean {
        const result = this.#maskVariants.some(mask => {
            return this.#matchMask(mask, pathname);
        });

        return result;
    }


    #getMatchedMask(pathname: string): string | null {
        const result = this.#maskVariants.find(mask => {
            return this.#matchMask(mask, pathname);
        }) ?? null;

        return result;
    }


    #matchMask(mask: string, pathname: string): boolean {
        const compute = (mask: string, pathname: string) => {
            const paramParser = this.#createParamParser(mask);

            paramParser.lastIndex = 0;
            if (!paramParser.test(pathname)) return false;

            const paramDeclarations = this.#parseParamDeclarations(mask);
            if (paramDeclarations === null) return true;

            const paramValues = this.#parseParamValues(mask, mask, pathname);
            if (paramValues === null) return false;

            return Array.from(paramValues.values()).every(({ valid }) => valid);
        }

        return this.#matchCache.load(`${mask}|${pathname}`, () => compute(mask, pathname));
    }


    #parseParamDeclarations(mask: string): ParamDeclarationsType | null {
        const parse = (mask: string) => {
            const declarations: ParamDeclarationsType = new Map();

            let order = 1;
            let matches: RegExpExecArray | null = null;

            this.#maskParser.lastIndex = 0;
            while ((matches = this.#maskParser.exec(mask)) !== null) {
                const groups = matches.groups! as {
                    name: string,
                    defaultValue: string | null,
                    expression: string | null,
                };

                const name = groups.name;

                const defaultValue = (v => {
                    if (v !== null && v !== '') return v;
                    return null;
                })(groups.defaultValue?.trim() ?? null);

                const expression = (v => {
                    if (v !== null) {
                        try {
                            return new RegExp(v);
                        } catch (_err) {
                            throw new RouterMalformedException(`Invalid expression for argument "${name}"`);
                        }
                    } return null;
                })(groups.expression ?? null);

                declarations.set(name, {
                    order,
                    defaultValue,
                    expression,
                })

                order++;
            }

            return declarations;
        }

        return this.#paramDeclarationCache.load(mask, () => parse(mask));
    }


    #parseParamValues(primaryMask: string, matchedMask: string, pathname: string): ParamValuesType | null {
        const isValid = (value: string | null, expression: RegExp | null): boolean => {
            if (expression === null) return true;
            if (value === null) return false;

            expression.lastIndex = 0;
            return expression.test(value)
        }

        const parse = (primaryMask: string, matchedMask: string, pathname: string) => {
            const paramParser = this.#createParamParser(matchedMask);
            const paramValues: ParamValuesType = new Map();

            const paramDeclarations = this.#parseParamDeclarations(primaryMask);
            if (paramDeclarations === null) return paramValues;

            paramParser.lastIndex = 0;
            const exec = paramParser.exec(pathname);

            const parsedValues = exec?.groups ?? {};

            let order = 1;
            for (const [name, declaration] of paramDeclarations) {
                const parsedValue = parsedValues[name] as string | undefined;
                const value = parsedValue ?? declaration.defaultValue ?? null;
                const valid = isValid(value, declaration.expression);

                paramValues.set(name, {
                    order,
                    value,
                    valid,
                });

                order++;
            }

            return paramValues;
        }

        return this.#paramValuesCache.load(`${primaryMask}|${matchedMask}|${pathname}`, () => parse(primaryMask, matchedMask, pathname));
    }


    #createParamParser(mask: string): RegExp {
        const parse = (mask: string): RegExp => {
            this.#maskParser.lastIndex = 0;
            const regexp = mask.replace(this.#maskParser, (_substring, matchedName) => {
                return `(?<${matchedName}>[a-zA-Z0-9_~:.=+\-]+)`
            });

            return new RegExp(`^${regexp}$`);
        };

        return this.#paramParserCache.load(mask, () => parse(mask));
    }


    #parseVariants(mask: string): string[] {
        const parse = (mask: string): string[] => {
            const openChar = this.#varibleOpenChar;
            const closeChar = this.#varibleCloseChar;

            type RangeType = {
                open: number,
                close: number,
            };

            const ranges: RangeType[] = []

            let openPos: number | null = null;
            let closePos: number | null = null;

            let skipClosing = 0;

            for (let i = 0; i < mask.length; i++) {
                const char = mask.at(i);

                if (char === openChar) {
                    if (openPos === null) openPos = i;
                    else skipClosing++;

                } else if (char === closeChar) {
                    if (skipClosing === 0) closePos = i;
                    else skipClosing--;
                }

                if (openPos !== null && closePos !== null) {
                    ranges.push({
                        open: openPos,
                        close: closePos + 1,
                    });

                    openPos = null;
                    closePos = null;
                }
            }

            if ((openPos === null && closePos !== null) || (openPos !== null && closePos === null)) throw new RouterMalformedException(`Malformed Mask "${mask}"`);

            if (ranges.length === 0) return [mask];

            const baseParts: string[] = ranges.reduce((acc: number[], v, i, arr) => {
                if (i === 0) acc.push(0);
                acc.push(v.open, v.close);
                if (i === arr.length - 1) acc.push(mask.length);

                return acc;
            }, []).reduce((acc: RangeType[], _n, i, arr) => {
                if (i % 2 !== 0) return acc;

                acc.push({
                    open: arr[i + 0],
                    close: arr[i + 1],
                });

                return acc;
            }, []).map(range => mask.substring(range.open, range.close));

            const optionalParts: string[] = ranges.map(range => mask.substring(range.open + openChar.length, range.close - closeChar.length));

            const variations: string[] = []

            for (let i = 0; i <= optionalParts.length; i++) {
                for (let j = i; j <= optionalParts.length; j++) {
                    const optionals = [...Array(i).map(_ => ''), ...optionalParts.slice(i, j)];

                    const variation = baseParts.reduce((acc: string[], v, n) => {
                        acc.push(v);
                        acc.push(optionals.at(n) ?? '');

                        return acc;
                    }, []).join('');

                    variations.push(variation);
                }
            }

            const result = variations.reduce((acc: string[], variation) => {
                acc.push(...this.#parseVariants(variation));

                return acc;
            }, []).filter((v, i, arr) => arr.indexOf(v) === i);

            return result;
        }

        return this.#variantCache.load(mask, () => parse(Router.cleanPathname(mask)));
    }


    #parseMask(mask: string): string {
        const parse = (mask: string): string => {
            const openChar = this.#varibleOpenChar;
            const closeChar = this.#varibleCloseChar;

            return Router.cleanPathname(mask)
                .replaceAll(openChar, '')
                .replaceAll(closeChar, '');
        }

        return this.#maskCache.load(mask, () => parse(mask));
    }


    #computePathname(req: Request): string {
        const url = new URL(req.url);
        const pathname = this.#options.tranformPathname(url.pathname);

        return Router.cleanPathname(pathname);
    }
}
