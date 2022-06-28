/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */

import { assertEquals } from "../libs/testing_asserts.ts";
import { MaskRouter } from "../routers/MaskRouter.ts";


type TaskType<T> = {
    mask: string,
    pathname: string | string[],
    expectation: T
}


Deno.test("MaskRouter::match", async () => {
    async function test(task: TaskType<boolean>) {
        const wrappers = [
            ['', ''],
            ['', '/'],
            ['/', ''],
            ['/', '/'],
        ];

        const pathnames = task.pathname instanceof Array ? task.pathname : [task.pathname];

        for (const pathname of pathnames) {
            for await (const [prefix, suffix] of wrappers) {
                const mask = `${prefix}${task.mask}${suffix}`;
                const serveResponse = () => new Response();

                const router = new MaskRouter(mask, serveResponse);

                const url = `http://localhost/${pathname}${suffix}`;
                const request = new Request(url);
                const match = router.match(request);

                assertEquals(match, task.expectation, `${Deno.inspect(url)} << mask=${Deno.inspect(mask)}`);

                if (match) await router.serveResponse(request);
            }
        }
    }

    const tasks: TaskType<boolean>[] = [
        {
            mask: "",
            pathname: "",
            expectation: true,
        },
        {
            mask: "",
            pathname: "page",
            expectation: false,
        },
        {
            mask: "foo",
            pathname: "foo",
            expectation: true,
        },
        {
            mask: "foo/bar",
            pathname: "foo/bar",
            expectation: true,
        },
        {
            mask: "foo[/bar]",
            pathname: ["foo", "foo/bar"],
            expectation: true,
        },
        {
            mask: "[foo/]bar",
            pathname: ["bar", "foo/bar"],
            expectation: true,
        },
        {
            mask: "[foo[/bar]]",
            pathname: ["", "foo", "foo/bar"],
            expectation: true,
        },
        {
            mask: "[<presenter>[/<action>]]",
            pathname: ["", "homepage", "homepage/profile", "contact", "contact/detail", "contact/map"],
            expectation: true,
        },
    ];


    for (const task of tasks) {
        await test(task);
    }
});


Deno.test("MaskRouter::parseParams", async () => {
    async function test(task: TaskType<Record<string, string> | null>) {
        const serveResponse = (_req: Request, params: Record<string, string>) => {
            assertEquals(params, task.expectation ?? {});
            return new Response();
        };

        const router = new MaskRouter(task.mask, serveResponse);

        const url = `http://localhost/${task.pathname}`;
        const request = new Request(url);
        const match = router.match(request);

        if (match) {
            await router.serveResponse(request);
        } else {
            assertEquals(null, task.expectation);
        }

    }

    const tasks: TaskType<Record<string, string> | null>[] = [
        {
            mask: "",
            pathname: "",
            expectation: {},
        },
        {
            mask: "<presenter>/<action>",
            pathname: "homepage/default",
            expectation: {
                presenter: "homepage",
                action: "default",
            },
        },
        {
            mask: "<presenter>[/<action>]",
            pathname: "homepage/default",
            expectation: {
                presenter: "homepage",
                action: "default",
            },
        },
        {
            mask: "<presenter>[/<action>]",
            pathname: "homepage",
            expectation: {
                presenter: "homepage",
            },
        },
        {
            mask: "[<presenter=homepage>[/<action=default>]]",
            pathname: "",
            expectation: {
                presenter: "homepage",
                action: "default",
            },
        },
        {
            mask: "[<s= >]",
            pathname: "",
            expectation: {
            },
        },
    ];


    for (const task of tasks) {
        await test(task);
    }
});


Deno.test("MaskRouter::recontructPathname", () => {
    type Task = {
        mask: string,
        params: Record<string, string>,
        expectation: string,
    }

    const tasks: Task[] = [
        {
            expectation: 'product/detail/abc123',
            mask: '<controller>/<action>/<id>',
            params: {
                controller: "product",
                action: "detail",
                id: "abc123",
            }
        },
        {
            expectation: 'mrkev',
            mask: '<vegetable-name>',
            params: {
                "vegetable-name": "mrkev",
            }
        },
    ];


    tasks.forEach(({ mask, params, expectation }) => {
        const serveResponse = () => new Response();
        const router = new MaskRouter(mask, serveResponse);
        const urlPath = router.recontructPathname(params)

        assertEquals(urlPath, expectation);
    });
});
