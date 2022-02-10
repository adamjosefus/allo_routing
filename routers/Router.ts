/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


import type { IRouter } from "../types/IRouter.ts";


export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T) => fns.reduce((acc, fn) => fn(acc), value);


const removeStartSlash = (s: string) => {
    if (s.startsWith("/")) return s.substring(1);
    return s;
};

const removeEndSlash = (s: string) => {
    if (s.endsWith("/")) return s.substring(0, s.length - 1);
    return s;
};


export abstract class Router implements IRouter {
    abstract match(req: Request): boolean | Promise<boolean>;
    abstract serveResponse(req: Request): Response | Promise<Response>;


    /**
     * Clean pathname.
     * Remove start and end slashes.
     */
    static cleanPathname(pathname: string): string {
        return pipe(
            removeStartSlash,
            removeEndSlash,
        )(pathname);
    }


    /**
     * Clean URL.
     * Remove end slash.
     */
    static cleanUrl(url: string): string {
        return pipe(
            removeEndSlash,
        )(url);
    }
}