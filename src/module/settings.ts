import {
	SubSonicCredentialConfig,
	SubSonicCredentialOptions,
} from "./config/subsonic-credentials-config";
import {
	SubsonicPlaylistConfig,
	SubsonicPlaylistOptions,
} from "./config/subsonic-playlist-config";
import { getGame } from "./util/game";
import fields = foundry.data.fields;

export const registerSettings = function () {
	getGame().settings.registerMenu(
		"foundryvtt-subsonic-player",
		"subsonic-credentials-options",
		{
			name: "subsonic.credentials.menu.title",
			label: "subsonic.credentials.menu.label",
			hint: "subsonic.credentials.menu.hint",
			icon: "fa-solid fa-id-card",
			type: SubSonicCredentialConfig,
			restricted: true,
		},
	);

	getGame().settings.register(
		"foundryvtt-subsonic-player",
		"subsonic-credentials-options",
		{
			scope: "world",
			config: false,
			type: SubSonicCredentialOptions,
			default: new SubSonicCredentialOptions(),
			requiresReload: true,
		},
	);

	getGame().settings.registerMenu(
		"foundryvtt-subsonic-player",
		"subsonic-playlist-options",
		{
			name: "subsonic.playlist.menu.title",
			label: "subsonic.playlist.menu.label",
			hint: "subsonic.playlist.menu.hint",
			icon: "fa-solid fa-list",
			type: SubsonicPlaylistConfig,
			restricted: true,
		},
	);

	getGame().settings.register(
		"foundryvtt-subsonic-player",
		"subsonic-playlist-options",
		{
			scope: "world",
			config: false,
			type: SubsonicPlaylistOptions,
			default: new SubsonicPlaylistOptions(),
			requiresReload: true,
		},
	);
};
