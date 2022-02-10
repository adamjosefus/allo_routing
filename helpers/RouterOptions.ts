/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


export type RouterOptions = {
    /**
     * Transform `pathname` to new shape.
     * May be usfull if you have shifted server root.
     * 
     * ```ts
     * const options: RouterOptions = {
     *     // URL: "http://localhost/my-root/product/detail"
     *     // Transform "my-root/product/detail" => "product/detail"

     *     tranformPathname: (pathname) => {
     *         const prefix = "my-root";
     * 
     *         if (pathname.startsWith(prefix))
     *             return pathname.substring(prefix.length);
     * 
     *         return pathname;
     *     }
     * }
     * ```
     */
    tranformPathname?: (pathname: string) => string;
}


/**
 * Create `RouterOptions` with all requesred properties.
 * Missin properties will be set to default values.
 */
export function createRequiredOptions(options?: RouterOptions): Required<RouterOptions> {
    const fallback: Required<RouterOptions> = {
        tranformPathname: (pathname: string) => pathname,
    }

    return {
        tranformPathname: options?.tranformPathname ?? fallback.tranformPathname,
    }
}
