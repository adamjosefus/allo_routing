/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


export interface IRouter {
    match(req: Request): boolean | Promise<boolean>;
    serveResponse(req: Request): Response | Promise<Response>;
}
