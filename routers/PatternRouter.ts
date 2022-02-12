/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


import { Cache } from "https://deno.land/x/allo_caching@v1.0.2/mod.ts";
import { ServeResponseType } from "../types/ServeResponseType.ts";
import { type IRouter } from "../types/IRouter.ts";
import { Router } from "./Router.ts";
import { type RouterOptions, createRequiredOptions } from "../helpers/RouterOptions.ts";


export class PatternRouter extends Router implements IRouter {

    readonly #pattern: URLPattern;
    readonly #serveResponse: ServeResponseType;
    readonly #options: Required<RouterOptions>;

    readonly #computedUrlCache = new Cache<string>();
    readonly #matchCache = new Cache<boolean>();


    /**
     * Create new isnatnce of `PatternRouter`.
     * @param pattern If value is type of `string`, it will be converted to `URLPattern`.
     * @param serveResponse 
     * @param options 
     */
    constructor(pattern: URLPattern | string, serveResponse: ServeResponseType, options?: RouterOptions) {
        super();

        this.#pattern = typeof pattern === "string"
            ? new URLPattern({ pathname: `/${PatternRouter.cleanPathname(pattern)}` })
            : pattern;
        this.#serveResponse = serveResponse;
        this.#options = createRequiredOptions(options);
    }


    match(req: Request): boolean {
        return this.#matchCache.load(req.url, () => {
            const url = this.#computeUrl(req.url);
            return this.#pattern.test(url);
        });
    }


    async serveResponse(req: Request): Promise<Response> {
        const url = this.#computeUrl(req.url);
        const exec = this.#pattern.exec(url);
        const groups = PatternRouter.mergeGroups(exec);

        return await this.#serveResponse(req, groups);
    }


    #computeUrl(url: string): string {
        return this.#computedUrlCache.load(url, () => {
            const oldUrl = new URL(url);
            const pathname = this.#options.tranformPathname(oldUrl.pathname);

            const newUrl = new URL(PatternRouter.cleanPathname(pathname), oldUrl.origin);
            newUrl.port = oldUrl.port;
            newUrl.username = oldUrl.username;
            newUrl.password = oldUrl.password;
            newUrl.search = oldUrl.search;
            newUrl.hash = oldUrl.hash;

            return newUrl.toString();
        });
    }


    static mergeGroups(result: URLPatternResult | null): Record<string, string> {
        if (result === null) return {};

        function clean(group: Record<string, string>): Record<string, string> {
            const params: Record<string, string> = {};

            for (const [key, value] of Object.entries(group)) {
                if (Number.isInteger(Number(key))) continue;

                params[key] = value;
            }

            return params;
        }

        return {
            ...clean(result.protocol.groups),
            ...clean(result.username.groups),
            ...clean(result.password.groups),
            ...clean(result.hostname.groups),
            ...clean(result.port.groups),
            ...clean(result.pathname.groups),
            ...clean(result.search.groups),
            ...clean(result.hash.groups),
        };
    }
}