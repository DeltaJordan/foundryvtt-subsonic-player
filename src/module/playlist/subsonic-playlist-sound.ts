import ClientDocumentMixin = foundry.documents.abstract.ClientDocumentMixin;
import fields = foundry.data.fields;

export default class SubsonicPlaylistSound extends PlaylistSound {
	get streamUrl(): string {
		return this.getFlag("foundryvtt-subsonic-player", "stream_url");
	}

	get isSubsonicStream(): boolean {
		return this.getFlag("foundryvtt-subsonic-player", "is_subsonic_stream");
	}

	/** @override */
	_createSound() {
		if (!this.isSubsonicStream) {
			return super._createSound();
		}

		if (game.audio.locked) {
			throw new Error(
				"You may not call PlaylistSound#_createSound until after game audio is unlocked.",
			);
		}

		if (!(this.id && this.streamUrl)) return null;

		const sound = game.audio.create({
			src: this.streamUrl,
			context: this.context,
			singleton: false,
		});

		sound.addEventListener("play", this._onStart.bind(this));
		sound.addEventListener("end", this._onEnd.bind(this));
		sound.addEventListener("stop", this._onStop.bind(this));

		return sound;
	}
}

export function extendPlaylistSoundConfig(
	app: foundry.applications.sheets.PlaylistSoundConfig,
	html: HTMLElement,
) {
	const isSubsonicStream = app.document.isSubsonicStream;
	if (isSubsonicStream) {
		const pathField = html.querySelector<HTMLInputElement>(
			"file-picker[name=path]",
		);
		if (!pathField) return;

		const streamUrlField = foundry.applications.fields.createTextInput({
			name: "flags.foundryvtt_subsonic_player.is_subsonic_stream",
			readonly: true,
			value: app.document.streamUrl,
		});

		pathField.before(streamUrlField);

		pathField.hidden = true;
	}
}
