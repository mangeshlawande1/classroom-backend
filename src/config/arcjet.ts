import arcjet, {shield, detectBot, slidingWindow } from "@arcjet/node";

const isTest = process.env.NODE_ENV === "test";
const arcjetKey = process.env.ARCJET_KEY;

    if(!arcjetKey && !isTest) {
    throw new Error("ARCJET_KEY env is required! ");
}
const aj = arcjet({
        key: arcjetKey ?? "test-key",

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