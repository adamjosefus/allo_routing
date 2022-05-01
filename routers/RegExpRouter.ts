/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */

import { ServeResponseType } from "../types/ServeResponseType.ts";
import { type IRouter } from "../types/IRouter.ts";
import { Router } from "./Router.ts";
import { type RouterOptions, createRequiredOptions } from "../helpers/RouterOptions.ts";


export class RegExpRouter extends Router implements IRouter {

    readonly #regexp: RegExp;
    readonly #serveResponse: ServeResponseType;
    readonly #options: Required<RouterOptions>;


    /**
     * 
     * @param regexp If value is type of `string`, it will be converted to `RegExp`.
     * @param serveResponse 
     * @param options 
     */
    constructor(regexp: RegExp | string, serveResponse: ServeResponseType, options?: RouterOptions) {
        super();

        this.#regexp = typeof regexp === "string" ? new RegExp(regexp) : regexp;
        this.#serveResponse = serveResponse;
        this.#options = createRequiredOptions(options);
    }


    match(req: Request): boolean {
        const pathname = this.#computePathname(req);

        this.#regexp.lastIndex = 0;
        return this.#regexp.test(pathname);
    }


    async serveResponse(req: Request): Promise<Response> {
        const pathname = this.#computePathname(req);

        this.#regexp.lastIndex = 0;
        const exec = this.#regexp.exec(pathname);
        const groups = exec?.groups ?? {} as Record<string, string>;

        return await this.#serveResponse(req, groups);
    }


    #computePathname(req: Request): string {
        const url = new URL(req.url);
        const pathname = this.#options.tranformPathname(url.pathname);

        return Router.cleanPathname(pathname);
    }
}
