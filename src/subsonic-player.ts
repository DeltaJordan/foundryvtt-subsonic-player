import SubsonicAPI from "subsonic-api";
import { registerSettings } from "./module/settings";
import { getGame } from "./module/util/game";

import SubsonicPlaylistSound, {
	extendPlaylistSoundConfig,
} from "./module/playlist/subsonic-playlist-sound";
import "./subsonic-player.scss";

async function syncPlaylists(api: SubsonicAPI): Promise<void> {
	const playlistConfig = getGame().settings.get(
		"foundryvtt-subsonic-player",
		"subsonic-playlist-options",
	);

	const playlists = await api.getPlaylists();
	if (playlists.status !== "ok") {
		throw new Error("Failed to retrieve playlists.");
	}

	const allPlaylists = playlists.playlists.playlist;
	if (!allPlaylists) {
		ui.notifications.warn("subsonic.sync.playlists.none", {
			localize: true,
		});
		return;
	}

	const playlistCount = allPlaylists.length;
	if (!playlistCount) {
		ui.notifications.warn("subsonic.sync.playlists.none", {
			localize: true,
		});
		return;
	}

	const oldSubsonicFolder = game.playlists.folders.find(
		(f) => f.name === "Subsonic Playlists",
	);

	if (oldSubsonicFolder) {
		await Folder.deleteDocuments([oldSubsonicFolder.id], {
			deleteContents: true,
			deleteSubfolders: true,
		});
	}

	const newSubsonicFolder = await Folder.create({
		color: "#0084ff",
		description:
			"Folder for Subsonic playlists. NOTE: Any playlists added to this folder will be deleted during the next sync!",
		name: "Subsonic Playlists",
		sorting: "a",
		type: "Playlist",
	});

	if (!newSubsonicFolder) {
		ui.notifications.error("Failed to create Subsonic folder.");
		return;
	}

	let progress = 0;
	const progressNotif = ui.notifications.info(
		"subsonic.sync.playlists.progress",
		{
			localize: true,
			progress: true,
		},
	);

	for (const playlist of allPlaylists) {
		const blacklistConfig = playlistConfig.playlists.find(
			(p) => p.id === playlist.id,
		);

		if (!blacklistConfig) {
			playlistConfig.playlists.push({
				id: playlist.id,
				name: playlist.name,
				blacklisted: "false",
			});
		} else if (blacklistConfig.blacklisted === "true") {
			continue;
		}

		progressNotif.update({
			pct: progress / playlistCount,
			message: "subsonic.sync.playlists.progress",
			localize: true,
		});

		const currentPlaylist = await api.getPlaylist({
			id: playlist.id,
		});

		const songEntries = currentPlaylist.playlist.entry;
		if (!songEntries) {
			ui.notifications.warn("subsonic.sync.playlist.failed", {
				format: {
					playlistName: playlist.name,
				},
				localize: true,
			});

			continue;
		}

		const playlistSounds: PlaylistSound[] = [];
		for (const song of songEntries) {
			const streamUrl = await api.streamURL({
				id: song.id,
				maxBitRate: 320,
			});

			const subsonicSound = new SubsonicPlaylistSound({
				name: song.title,
				description: song.comment,
				path: "placeholder.ogg", // TODO: Is there a better way to skip field validation?
				channel: "music",
				flags: {
					"foundryvtt-subsonic-player": {
						stream_url: streamUrl,
						is_subsonic_stream: true,
					},
				},
			});

			if (!subsonicSound) {
				ui.notifications.warn("subsonic.create.song.failed", {
					format: {
						songTitle: song.title,
						playlistName: playlist.name,
					},
					localize: true,
				});

				continue;
			}

			playlistSounds.push(subsonicSound);
		}

		const foundryPlaylist = await Playlist.create({
			name: currentPlaylist.playlist.name,
			description: currentPlaylist.playlist.comment ?? "",
			channel: "music",
			sounds: playlistSounds,
			folder: newSubsonicFolder._id,
			mode: playlistConfig.defaultPlaylistMode as foundry.CONST.PLAYLIST_MODES,
		});

		if (!foundryPlaylist) {
			ui.notifications.warn("subsonic.create.playlist.failed", {
				format: {
					playlistName: playlist.name,
				},
				localize: true,
			});

			continue;
		}

		game.playlists.set(foundryPlaylist.id, foundryPlaylist);

		progress++;
	}

	let test = await getGame().settings.set(
		"foundryvtt-subsonic-player",
		"subsonic-playlist-options",
		playlistConfig,
	);

	progressNotif.update({
		pct: 1.0,
		message: "subsonic.sync.playlists.progress",
		localize: true,
	});

	console.log(test);
}

Hooks.once("init", () => {
	console.log("Initializing Subsonic Music Player...");

	Handlebars.registerHelper("stringBoolean", function (value) {
		return value && value === "true";
	});

	CONFIG.PlaylistSound.documentClass = SubsonicPlaylistSound;

	registerSettings();
});

Hooks.once("ready", async () => {
	const credentials = getGame().settings.get(
		"foundryvtt-subsonic-player",
		"subsonic-credentials-options",
	);

	if (credentials.isValid()) {
		const api = new SubsonicAPI({
			url: credentials.serverUrl,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});

		const pingResult = await api.ping();
		if (pingResult.status !== "ok") {
			ui.notifications.error("subsonic.login.failed", {
				localize: true,
				permanent: true,
			});
			return;
		}

		console.log(
			`Successfully logged in to Subsonic server ${credentials.serverUrl}`,
		);

		await syncPlaylists(api);
	}
});

Hooks.on("renderPlaylistSoundConfig", extendPlaylistSoundConfig);
