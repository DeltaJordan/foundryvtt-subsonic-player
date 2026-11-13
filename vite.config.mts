import { svelte } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import foundryvtt from "vite-plugin-foundryvtt";

import moduleJson from "./src/module.json" with { type: "json" };

export default defineConfig({
	base: "/modules/foundryvtt-subsonic-player/",
	server: {
		port: 30001,
		open: "/",
		proxy: {
			"^(?!/modules/foundryvtt-subsonic-player)":
				"http://localhost:30000/",
			"/socket.io": {
				target: "ws://localhost:30000",
				ws: true,
			},
		},
	},
	build: {
		emptyOutDir: false,
		sourcemap: true,
		lib: {
			name: "foundryvtt-subsonic-player",
			entry: "src/subsonic-player.ts",
			formats: ["es"],
			fileName: "subsonic-player",
		},
		rolldownOptions: {
			output: {
				keepNames: true,
			},
		},
	},
	plugins: [
		checker({ typescript: true, enableBuild: false }),
		svelte({ preprocess: sveltePreprocess() }),
		foundryvtt(moduleJson, {
			type: "module",
		}),
	],
});
