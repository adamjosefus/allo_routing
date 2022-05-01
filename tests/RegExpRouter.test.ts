/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";
import { RegExpRouter } from "../routers/RegExpRouter.ts";


type TaskType<T> = {
    expression: string,
    pathname: string,
    expectation: T
}



Deno.test("RegExpRouter::match", async () => {
    async function test(task: TaskType<boolean>) {
        const wrappers = ['', '/'];

        for await (const suffix of wrappers) {
            const serveResponse = () => new Response();

            const router = new RegExpRouter(task.expression, serveResponse);

            const url = `http://localhost/${task.pathname}${suffix}`;
            const request = new Request(url);
            const match = router.match(request);

            assertEquals(match, task.expectation);

            if (match) await router.serveResponse(request);
        }
    }

    const tasks: TaskType<boolean>[] = [
        {
            expression: ".*",
            pathname: "",
            expectation: true,
        },
        {
            expression: "foo|bar",
            pathname: "foo",
            expectation: true,
        },
        {
            expression: "auto",
            pathname: "autonomie",
            expectation: true,
        },
        {
            expression: "auto$",
            pathname: "autonomie",
            expectation: false,
        },
    ];


    for (const task of tasks) {
        await test(task);
    }
});



Deno.test("RegExpRouter::parseParams", async () => {
    async function test(task: TaskType<Record<string, string> | null>) {
        const serveResponse = (_req: Request, params: Record<string, string>) => {
            assertEquals(params, task.expectation ?? {});
            return new Response();
        };

        const router = new RegExpRouter(task.expression, serveResponse);

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
            expression: "^foo/(?<page>.+)$",
            pathname: "foo/bar",
            expectation: { page: "bar" },
        },
        {
            expression: "^foo/(.+)$",
            pathname: "foo/bar",
            expectation: {},
        },
    ];


    for (const task of tasks) {
        await test(task);
    }
});
