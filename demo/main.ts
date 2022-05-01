import { Server } from "https://deno.land/x/allo_server@v1.0.0-beta/mod.ts";
import { RouterList } from "../mod.ts";

const router = new RouterList();

// router.add('/', (req) => {
//     return new Response(`Homepage`);
// });

// router.add('/page-one', (req) => {
//     return new Response(`Page One`);
// });

// router.add('/page-<number>', (req, { number }) => {
//     return new Response(`Page ${number}`);
// });

router.add(/^[0-9]+$/g, (req) => {
    return new Response(`Page regex`);
});

const server = new Server(router);
server.listen({ port: 8080 });

console.log("Server started on http://localhost:8080");


setTimeout(() => {
    console.log("Fetch!");
    
    fetch("http://localhost:8080/123")
}, 400);

