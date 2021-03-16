module.exports = {
	Name: "doesnotexist",
	Aliases: ["dne"],
	Author: "supinic",
	Cooldown: 15000,
	Description: "Posts a random picture from the site thispersondoesnotexist.com, and its variants (artwork, cat, horse, person). These pictures are not real, they have been generated by an AI.",
	Flags: ["link-only","mention","non-nullable","pipe","use-params"],
	Params: [
		{ name: "wordOnly", type: "boolean" }
	],
	Whitelist_Response: null,
	Static_Data: (() => {
		const buildURL = (type) => {
			if (type === "person") {
				return `https://this${type}doesnotexist.com/image`;
			}
			else {
				return `https://this${type}doesnotexist.com`;
			}
		};

		return {
			types: ["artwork", "cat", "horse", "person", "waifu", "word"],
			fetch: [
				{
					method: "reuploading a provided random image",
					descriptions: ["artwork", "cat", "horse", "person"].map(i => (
						`<code>${i}</code> - <a href="${buildURL(i)}">This ${i} does not exist</a>`
					)),
					types: ["artwork", "cat", "horse", "person"],
					execute: async (context, type) => {
						const imageData = await sb.Got({
							url: buildURL(type),
							responseType: "buffer",
							throwHttpErrors: false
						});

						if (imageData.statusCode !== 200) {
							console.warn("dne download failed", imageData);
							return {
								success: false,
								reply: `Fetching image data failed monkaS`
							};
						}

						const { statusCode, link } = await sb.Utils.uploadToNuuls(imageData.rawBody ?? imageData.body);
						if (statusCode !== 200) {
							return {
								success: false,
								reply: `Could not upload the image! Error: ${statusCode}`
							};
						}

						return {
							link,
							reply: `This ${type} does not exist: ${link}`
						};
					}
				},
				{
					method: "rolls a random number for a static link",
					types: ["waifu"],
					descriptions: [`<code>waifu</code> - <a href="https://www.thiswaifudoesnotexist.net/">This waifu does not exist</a>`],
					execute: async (context, type) => {
						const number = sb.Utils.random(1, 1e6);
						const link = `https://www.thiswaifudoesnotexist.net/example-${number}.jpg`;
						return {
							link,
							reply: `This ${type} does not exist: ${link}`
						};
					}
				},
				{
					method: "scraping for random word",
					types: ["word"],
					descriptions: [`<code>word</code> - <a href="https://www.thisworddoesnotexist.com/">This word does not exist</a>`],
					execute: async (context, type) => {
						const html = await sb.Got("https://www.thisworddoesnotexist.com/").text();
						const $ = sb.Utils.cheerio(html);

						const wordClass = $("div#definition-pos").text().replace(/\./g, "").trim();
						const word = $("div#definition-word").text();
						const definition = $("div#definition-definition").text().trim();
						const example = $("div#definition-example").text();

						if (context.params.wordOnly) {
							return {
								link: "No link available!",
								reply: word
							};
						}

						return {
							link: "No link available!",
							reply: sb.Utils.tag.trim `
								This ${type} does not exist:
								${word} (${wordClass}) -
								${definition}.
								Example: ${example ?? "N/A"}
							`
						};
					}
				}
			]
		};
	}),
	Code: (async function doesnotexist (context, type) {
	        const { fetch, types } = this.staticData;
	        if (!type) {
	            type = "person";
	        }

	        type = type.toLowerCase();
	        if (!types.includes(type)) {
	            return {
	                success: false,
	                reply: `Invalid type provided! Use one of: ${types.join(", ")}`
	            };
	        }

	        const { execute } = fetch.find(i => i.types.includes(type));
	        return await execute(context, type);
	    }),
	Dynamic_Description: (async (prefix, values) => {
	        const { fetch } = values.getStaticData();
	        const list = fetch.flatMap(i => i.descriptions).map(i => `<li>${i.description}</li>`).join("");
	
	        return [
	            `Posts a random picture from the set of "this X does not exist" websites.`,
	            "",
	
	            `<code>${prefix}dne</code>`,
	            "Posts a random person that does not exist",
	            "",
	
	            `<code>${prefix}dne (type)</code>`,
	            "Posts a random (type) that does not exist",
	            "",

				`<code>${prefix}dne word wordOnly:true</code>`,
				"Posts a random word, without the word class, definition or examples",
				"",
	
	            "Available types:",
	            `<ul>${list}</ul>`
	        ];
	    })
};