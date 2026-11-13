import type { SubsonicCredentialOptions } from "./module/config/subsonic-credentials-config";
import type { SubsonicPlaylistOptions } from "./module/config/subsonic-playlist-config";
import type SubsonicPlaylistSound from "./module/playlist/subsonic-playlist-sound";

declare module "fvtt-types/configuration" {
	interface SettingConfig {
		"foundryvtt-subsonic-player.subsonic-credentials-options": typeof SubsonicCredentialOptions;
		"foundryvtt-subsonic-player.subsonic-playlist-options": typeof SubsonicPlaylistOptions;
	}

	interface DocumentClassConfig {
		PlaylistSound: typeof SubsonicPlaylistSound;
	}

	interface FlagConfig {
		PlaylistSound: {
			"foundryvtt-subsonic-player": {
				stream_url: string;
				is_subsonic_stream: boolean;
			};
		};
	}

	interface AssumeHookRan {
		ready: true;
	}
}
