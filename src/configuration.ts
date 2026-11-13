import type { SubSonicCredentialOptions } from "./module/config/subsonic-credentials-config";
import type { SubsonicPlaylistOptions } from "./module/config/subsonic-playlist-config";
import type SubSonicPlaylistSound from "./module/playlist/subsonic-playlist-sound";

declare module "fvtt-types/configuration" {
	interface SettingConfig {
		"foundryvtt-subsonic-player.subsonic-credentials-options": typeof SubSonicCredentialOptions;
		"foundryvtt-subsonic-player.subsonic-playlist-options": typeof SubsonicPlaylistOptions;
	}

	interface DocumentClassConfig {
		PlaylistSound: typeof SubSonicPlaylistSound;
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
