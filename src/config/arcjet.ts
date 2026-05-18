import arcjet, {shield, detectBot, slidingWindow } from "@arcjet/node";

if(!process.env.ARCJET_KEY && process.env.NODE_ENV !=='test') {
    throw new Error("ARCJET_KEY env is required! ");
}
const aj = arcjet({
    key: process.env.ARCJET_KEY!,

    rules: [
        shield({ mode: "LIVE" }),
        // Create a bot detection rule
        detectBot({
            mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
            allow: [
                "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
                "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
            ],
        }),
        slidingWindow({
            mode: 'LIVE',
            interval:'2s',
            max: 5,
        }),
    ],
});

export default aj;