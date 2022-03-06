/**
 * @copyright Copyright (c) 2022 Adam Josefus
 */


import { assertEquals } from "https://deno.land/std@0.128.0/testing/asserts.ts";
import { PatternRouter } from "../routers/PatternRouter.ts";


type TaskType<T> = {
    pattern: string,
    pathname: string,
    expectation: T
}


Deno.test("PatternRouter::match", async () => {
    async function test(task: TaskType<boolean>) {
        const wrappers = [
            ['', ''],
            ['', '/'],
            ['/', ''],
            ['/', '/'],
        ];

        for await (const [prefix, suffix] of wrappers) {
            const pattern = `${prefix}${task.pattern}${suffix}`;
            const serveResponse = () => new Response();

            const router = new PatternRouter(pattern, serveResponse);

            const url = `http://localhost/${task.pathname}${suffix}`;
            const request = new Request(url);
            const match = router.match(request);

            assertEquals(match, task.expectation);

            if (match) await router.serveResponse(request);
        }
    }

    const tasks: TaskType<boolean>[] = [
        {
            pattern: "",
            pathname: "",
            expectation: true,
        },
        {
            pattern: "foo",
            pathname: "foo",
            expectation: true,
        },
        {
            pattern: "foo",
            pathname: "bar",
            expectation: false,
        },
        {
            pattern: "foo/:page",
            pathname: "foo/bar",
            expectation: true,
        },
        {
            pattern: ":id",
            pathname: "123",
            expectation: true,
        },
        {
            pattern: ":id(\\d+)",
            pathname: "123",
            expectation: true,
        },
        {
            pattern: ":id(\\d+)",
            pathname: "abc",
            expectation: false
        },
    ];


    for (const task of tasks) {
        await test(task);
    }
});


Deno.test("PatternRouter::parseParams", async () => {
    async function test(task: TaskType<Record<string, string> | null>) {
        const serveResponse = (_req: Request, params: Record<string, string>) => {
            assertEquals(params, task.expectation ?? {});
            return new Response();
        };

        const router = new PatternRouter(task.pattern, serveResponse);

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
            pattern: "foo/:page",
            pathname: "foo/bar",
            expectation: { page: "bar" },
        },
        {
            pattern: ":id",
            pathname: "123",
            expectation: { id: "123" },
        },
        {
            pattern: ":id(\\d+)",
            pathname: "123",
            expectation: { id: "123" },
        },
        {
            pattern: ":id([a-z]+)",
            pathname: "123",
            expectation: null,
        },
    ];


    for (const task of tasks) {
        await test(task);
    }
});
