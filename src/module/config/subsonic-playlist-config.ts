import type { DeepPartial } from "fvtt-types/utils";
import fields = foundry.data.fields;

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

interface Configuration
	extends foundry.applications.api.ApplicationV2.Configuration {}

interface RenderOptions
	extends foundry.applications.api.ApplicationV2.RenderOptions {
	loadEmpty: boolean;
}

export class SubsonicPlaylistConfig extends HandlebarsApplicationMixin(
	ApplicationV2<{}, Configuration, RenderOptions>,
) {
	static PARTS = {
		form: {
			id: "subsonicPlaylistConfig",
			template:
				"modules/foundryvtt-subsonic-player/templates/playlist-config.hbs",
			root: false,
		},
		footer: { template: "templates/generic/form-footer.hbs" },
	};

	static DEFAULT_OPTIONS = {
		id: "subsonic-playlist-config",
		tag: "form",
		position: { width: 550 },
		window: {
			title: "subsonic.playlist.menu.label",
			contentClasses: ["standard-form"],
		},
		form: {
			handler: this.#formHandler,
			submitOnChange: false,
			closeOnSubmit: true,
		},
		actions: {
			onLoadEmpty: this.#loadEmpty,
		},
	};

	static async #formHandler(
		this: SubsonicPlaylistConfig,
		_ev: unknown,
		_form: unknown,
		formData: any,
	) {
		const oldData = game.settings.get(
			"foundryvtt-subsonic-player",
			"subsonic-playlist-options",
		);

		for (let i = 0; i < oldData.playlists.length; i++) {
			const playlist = oldData.playlists[i];
			const isBlacklistedStr = formData.object[playlist.id as string];
			playlist.blacklisted = isBlacklistedStr ? "true" : "false";
		}

		const res = formData.object;
		res.playlists = oldData.playlists;
		await game.settings.set(
			"foundryvtt-subsonic-player",
			"subsonic-playlist-options",
			res,
		);
	}

	protected async _prepareContext(
		options: DeepPartial<RenderOptions> & { isFirstRender: boolean },
	): Promise<{}> {
		super._prepareContext;
		const config = game.settings.get(
			"foundryvtt-subsonic-player",
			"subsonic-playlist-options",
		);

		let empty = new SubsonicPlaylistOptions();
		empty.playlists = config.playlists.map((p) => {
			return {
				id: p.id,
				name: p.name,
				blacklisted: false,
			};
		});

		const ctxConfig = options.loadEmpty ? empty : config;

		ctxConfig.playlists.forEach(
			(p) => (p.blacklisted = p.blacklisted === "true"),
		);

		const ctx = {
			config: ctxConfig,
			fields: config.schema.fields,
			buttons: [
				{
					type: "submit",
					name: "submit",
					icon: "fas fa-save",
					label: "Save",
				},
				{
					type: "button",
					name: "clear",
					icon: "fas fa-cancel",
					label: "Clear All",
					action: "onLoadEmpty",
				},
			],
		};
		options.loadEmpty = false;
		return ctx;
	}

	static async #loadEmpty(this: SubsonicPlaylistConfig) {
		this.render(false, { loadEmpty: true });
	}
}

interface SubsonicPlaylistOptionsSchema extends foundry.data.fields.DataSchema {
	defaultPlaylistMode: fields.NumberField;
	playlists: fields.ArrayField<fields.ObjectField>;
}

export class SubsonicPlaylistOptions extends foundry.abstract
	.DataModel<SubsonicPlaylistOptionsSchema> {
	static defineSchema(): fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			defaultPlaylistMode: new fields.NumberField({
				required: true,
				label: "subsonic.playlist.defaultPlaylistMode.label",
				hint: "subsonic.playlist.defaultPlaylistMode.hint",
				choices: Object.entries(foundry.CONST.PLAYLIST_MODES).reduce(
					(obj, [key, value]) => {
						// @ts-ignore
						obj[value] = `PLAYLIST.Mode${key.titleCase()}`;
						return obj;
					},
					{},
				),
				initial: foundry.CONST.PLAYLIST_MODES.SHUFFLE,
				validationError: "must be a value in CONST.PLAYLIST_MODES",
			}),
			playlists: new fields.ArrayField(new fields.ObjectField()),
		};
	}
}
