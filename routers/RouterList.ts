/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


import { type IRouter } from "../types/IRouter.ts";
import { type RouterOptions, createRequiredOptions } from "../helpers/RouterOptions.ts";
import { ServeResponseType } from "../types/ServeResponseType.ts";
import { PatternRouter } from "./PatternRouter.ts";
import { RegExpRouter } from "./RegExpRouter.ts";
import { MaskRouter } from "./MaskRouter.ts";


type AddMethodEntry =
    | [mask: string, serveResponse: ServeResponseType]
    | [pattern: URLPattern, serveResponse: ServeResponseType]
    | [regexp: RegExp, serveResponse: ServeResponseType];


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


    /**
     * Adds router to list. Router must implement `IRouter` interface.
     * Router can be your custom class or instance of `PatternRouter`, `MaskRouter` or `RegExpRouter`.
     * 
     * Btw, also you can add another instance of `RouterList` too.
     */
    addRouter(router: IRouter): void {
        // Force transform to return promises. 
        const match = async (req: Request) => await router.match(req);
        const serveResponse = async (req: Request) => await router.serveResponse(req);

        this.#routers.push({ match, serveResponse });
    }


    /**
     * Adds new instance of router depending on `entry` argument.
     * 
     * - If is type of `string`.
     *  It will be used as *mask* for `MaskRouter`.
     * 
     * - If is type of `URLPattern`.
     *  It will be used as *pattern* for `PatternRouter`.
     * 
     * - If is type of `RegExp`.
     *  It will be used as *regexp* for `RegExpRouter`.
     * 
     */
    add(...entry: AddMethodEntry): void {
        const [route, serveResponse] = entry;

        if (typeof route === "string") {
            this.#addMaskRoute(route, serveResponse);
            return;
        }

        if (route instanceof URLPattern) {
            this.#addPatternRoute(route, serveResponse);
            return;
        }

        if (route instanceof RegExp) {
            this.#addRegExpRoute(route, serveResponse);
            return;
        }

        throw new Error("Invalid route.");
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
