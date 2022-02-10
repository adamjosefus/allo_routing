/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


export type ServeResponseType = (req: Request, params: Record<string, string>) => Response | Promise<Response>;
