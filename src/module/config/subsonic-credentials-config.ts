import type { DeepPartial } from "fvtt-types/utils";
import fields = foundry.data.fields;

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

interface Configuration
	extends foundry.applications.api.ApplicationV2.Configuration {}

interface RenderOptions
	extends foundry.applications.api.ApplicationV2.RenderOptions {
	loadEmpty: boolean;
}

export class SubSonicCredentialConfig extends HandlebarsApplicationMixin(
	ApplicationV2<{}, Configuration, RenderOptions>,
) {
	static PARTS = {
		form: {
			id: "subsonicCredentialsConfig",
			template:
				"modules/foundryvtt-subsonic-player/templates/credentials-config.hbs",
			root: true,
		},
		footer: { template: "templates/generic/form-footer.hbs" },
	};

	static DEFAULT_OPTIONS = {
		id: "subsonic-credentials-config",
		tag: "form",
		position: { width: 550 },
		window: {
			title: "subsonic.credentials.menu.label",
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
		this: SubSonicCredentialConfig,
		_ev: unknown,
		_form: unknown,
		formData: any,
	) {
		const res = formData.object;
		await game.settings.set(
			"foundryvtt-subsonic-player",
			"subsonic-credentials-options",
			res,
		);
	}

	protected async _prepareContext(
		options: DeepPartial<RenderOptions> & { isFirstRender: boolean },
	): Promise<{}> {
		super._prepareContext;
		const config = game.settings.get(
			"foundryvtt-subsonic-player",
			"subsonic-credentials-options",
		);
		const ctx = {
			config: options.loadEmpty
				? new SubSonicCredentialOptions()
				: config,
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

	static async #loadEmpty(this: SubSonicCredentialConfig) {
		this.render(false, { loadEmpty: true });
	}
}

interface SubSonicCredentialOptionsSchema
	extends foundry.data.fields.DataSchema {
	serverUrl: fields.StringField<{ initial: "https://demo.navidrome.org" }>;
	username: fields.StringField<{ initial: "" }>;
	password: fields.StringField<{ initial: "" }>;
}

export class SubSonicCredentialOptions extends foundry.abstract
	.DataModel<SubSonicCredentialOptionsSchema> {
	static defineSchema(): fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			serverUrl: new fields.StringField({
				required: true,
				initial: "https://demo.navidrome.org",
				label: "subsonic.credentials.serverUrl.label",
				hint: "subsonic.credentials.serverUrl.hint",
			}),
			username: new fields.StringField({
				required: true,
				initial: "demo",
				label: "subsonic.credentials.username.label",
				hint: "subsonic.credentials.username.hint",
			}),
			password: new fields.StringField({
				required: true,
				initial: "demo",
				label: "subsonic.credentials.password.label",
				hint: "subsonic.credentials.password.hint",
			}),
		};
	}

	isValid(): boolean {
		return !!this.serverUrl && !!this.username && !!this.password;
	}
}
