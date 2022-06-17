/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */

import { pipe } from "../helpers/pipe.ts";
import { type IRouter } from "../types/IRouter.ts";
import { type RouterOptions, createRequiredOptions } from "../helpers/RouterOptions.ts";
import { Status, getReasonPhrase } from "../helpers/Status.ts";
import { ServeResponseType } from "../types/ServeResponseType.ts";
import { Router } from "./Router.ts";
import { PatternRouter } from "./PatternRouter.ts";
import { RegExpRouter } from "./RegExpRouter.ts";
import { MaskRouter } from "./MaskRouter.ts";


type AddMethodEntry =
    | [router: IRouter]
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

    readonly #errors: Map<number, ServeResponseType> = new Map();


    constructor(options?: RouterOptions) {
        this.#options = createRequiredOptions(options);
    }


    /**
     * @deprecated Use `add` method instead.
     */
    addRouter(router: IRouter): void {
        this.add(router);
    }


    startsWith(path: string): RouterList {
        const searchString = Router.cleanPathname(path);

        const child = (() => {
            const tranformPathname = (pathname: string) => {
                return pipe<string>(
                    (s) => this.#options.tranformPathname(s),
                    (s) => Router.cleanPathname(s).slice(searchString.length),
                )(pathname);
            };

            return new RouterList({
                tranformPathname
            });
        })();

        const parent = (() => {
            const tranformPathname = (pathname: string) => {
                return this.#options.tranformPathname(pathname);
            }

            const initialCondition = (req: Request) => {
                const url = new URL(req.url);
                const pathname = pipe(
                    tranformPathname,
                    Router.cleanPathname,
                )(url.pathname);

                return pathname.startsWith(searchString);
            }

            return new RouterList({
                tranformPathname,
                initialCondition,
            });
        })();

        parent.add(child);
        this.add(parent);

        return child;
    }


    /**
     * Add route or router to list.
     * 
     * @returns Returns `this` for chaining.
     */
    add(...entry: AddMethodEntry): this {
        if (entry.length === 1) {
            return this.#addRouter(entry[0]);
        }

        const [route, serveResponse] = entry;

        if (typeof route === "string") {
            return this.#addMaskRoute(route, serveResponse);
        }

        if (route instanceof URLPattern) {
            return this.#addPatternRoute(route, serveResponse);
        }

        if (route instanceof RegExp) {
            return this.#addRegExpRoute(route, serveResponse);
        }

        throw new Error("Invalid route type.");
    }


    #addRouter(router: IRouter): this {
        // Force transform to returning promises. 
        const match = async (req: Request) => await router.match(req);
        const serveResponse = async (req: Request) => await router.serveResponse(req);

        this.#routers.push({ match, serveResponse });

        return this;
    }


    #addMaskRoute(mask: string, serveResponse: ServeResponseType): this {
        const router = new MaskRouter(mask, serveResponse, this.#options);
        return this.#addRouter(router);
    }


    #addPatternRoute(pattern: URLPattern, serveResponse: ServeResponseType): this {
        const router = new PatternRouter(pattern, serveResponse, this.#options);
        return this.#addRouter(router);
    }


    #addRegExpRoute(regexp: RegExp, serveResponse: ServeResponseType): this {
        const router = new RegExpRouter(regexp, serveResponse, this.#options);
        return this.#addRouter(router);
    }


    async match(req: Request): Promise<boolean> {
        const router = await this.#matchRouter(req);

        return router !== null;
    }


    async serveResponse(req: Request): Promise<Response> {
        const router = await this.#matchRouter(req);

        if (!router) {
            return await this.getErrorReponse(Status.S404_NotFound, req);
        }

        return await router.serveResponse(req);
    }


    async #matchRouter(req: Request): Promise<IRouter | null> {
        const initialCondition = await this.#options.initialCondition(req);
        if (!initialCondition) return null;

        for (const router of this.#routers) {
            const match = await router.match(req);
            if (match) return router;
        }

        return null;
    }


    setError(status: number, serveResponse: ServeResponseType): void {
        if (!Number.isInteger(status)) {
            throw new Error("Status must be integer.");
        }

        this.#errors.set(status, serveResponse);
    }


    async getErrorReponse(status: number, req: Request, params: Record<string, string> = {}): Promise<Response> {
        const serveResponse = this.#errors.get(status);
        const phrase = getReasonPhrase(status);

        if (serveResponse) {
            return await serveResponse(req, {
                status: status.toString(),
                phrase,
                ...params,
            });

        } else {
            return new Response(`${status}\n${phrase}`, {
                headers: { "Content-Type": "text/plain" },
                status,
            });
        }
    }
}
