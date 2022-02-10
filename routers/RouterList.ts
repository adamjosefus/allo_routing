/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


import { type IRouter } from "../types/IRouter.ts";
import { type RouterOptions, createRequiredOptions } from "../helpers/RouterOptions.ts";
import { ServeResponseType } from "../types/ServeResponseType.ts";
import { PatternRouter } from "./PatternRouter.ts";
import { RegExpRouter } from "./RegExpRouter.ts";
import { MaskRouter } from "./MaskRouter.ts";


/**
 * Class `RouterList` is main object. Contains all routers.
 * 
 * ```ts
 * const router = new RouterList();
 * 
 * // ...
 * 
 * if (router.match(request)) {
 *    const response = await router.serveResponse(request);
 * }
 * ```
 */
export class RouterList implements IRouter {

    readonly #options: Required<RouterOptions>;
    readonly #routers: {
        match(req: Request): Promise<boolean>;
        serveResponse(req: Request): Promise<Response>;
    }[] = [];


    constructor(options?: RouterOptions) {
        this.#options = createRequiredOptions(options);
    }


    addRouter(router: IRouter): void {
        // Force transform to return promises. 
        const match = async (req: Request) => await router.match(req);
        const serveResponse = async (req: Request) => await router.serveResponse(req);

        this.#routers.push({ match, serveResponse });
    }


    add(entry: string | URLPattern | RegExp, serveResponse: ServeResponseType): void {
        if (typeof entry === "string") {
            this.#addMaskRoute(entry, serveResponse);
            return;
        }

        if (entry instanceof URLPattern) {
            this.#addPatternRoute(entry, serveResponse);
            return;
        }

        if (entry instanceof RegExp) {
            this.#addRegExpRoute(entry, serveResponse);
            return;
        }

        throw new Error("Invalid entry");
    }


    #addMaskRoute(mask: string, serveResponse: ServeResponseType): void {
        const router = new MaskRouter(mask, serveResponse, this.#options);
        this.addRouter(router);
    }


    #addPatternRoute(pattern: URLPattern, serveResponse: ServeResponseType): void {
        const router = new PatternRouter(pattern, serveResponse, this.#options);
        this.addRouter(router);
    }


    #addRegExpRoute(regexp: RegExp, serveResponse: ServeResponseType): void {
        const router = new RegExpRouter(regexp, serveResponse, this.#options);
        this.addRouter(router);
    }


    async match(req: Request): Promise<boolean> {
        const router = await this.#matchRouter(req);

        return router !== null;
    }


    async serveResponse(req: Request): Promise<Response> {
        const router = await this.#matchRouter(req);

        if (!router) throw new Error("Router not found");

        return await router.serveResponse(req);
    }


    async #matchRouter(req: Request): Promise<IRouter | null> {
        for (const router of this.#routers) {
            const match = await router.match(req);

            if (match) return router;
        }

        return null;
    }
}