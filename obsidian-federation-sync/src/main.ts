import { Plugin, TFile, TAbstractFile, PluginSettingTab, App, Setting } from 'obsidian';

interface FederationSyncSettings {
    databaseUrl: string;
    apiKey: string;
}

const DEFAULT_SETTINGS: FederationSyncSettings = {
    databaseUrl: '',
    apiKey: ''
}

export default class FederationSyncPlugin extends Plugin {
    settings: FederationSyncSettings;

    async onload() {
        console.log('Loading Federation Sync plugin...');
        await this.loadSettings();

        // Add a settings tab so the user can configure DB connections
        this.addSettingTab(new FederationSyncSettingTab(this.app, this));

        // Listen to metadata changes (tags, frontmatter, links, etc.)
        this.registerEvent(
            this.app.metadataCache.on('changed', (file: TFile) => {
                this.handleMetadataChange(file);
            })
        );

        // Listen to file creations
        this.registerEvent(
            this.app.vault.on('create', (file: TAbstractFile) => {
                if (file instanceof TFile) {
                    this.handleFileCreate(file);
                }
            })
        );

        // Listen to file deletions
        this.registerEvent(
            this.app.vault.on('delete', (file: TAbstractFile) => {
                if (file instanceof TFile) {
                    this.handleFileDelete(file);
                }
            })
        );

        // Listen to file renames
        this.registerEvent(
            this.app.vault.on('rename', (file: TAbstractFile, oldPath: string) => {
                if (file instanceof TFile) {
                    this.handleFileRename(file, oldPath);
                }
            })
        );
    }

    onunload() {
        console.log('Unloading Federation Sync plugin...');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    // --- Real-time Sync Handlers ---

    private async handleMetadataChange(file: TFile) {
        const cache = this.app.metadataCache.getFileCache(file);
        console.log(`[Federation Sync] Metadata changed for file: ${file.path}`);
        await this.pushToFederation('UPDATE_METADATA', file, cache);
    }

    private async handleFileCreate(file: TFile) {
        console.log(`[Federation Sync] File created: ${file.path}`);
        await this.pushToFederation('CREATE_FILE', file);
    }

    private async handleFileDelete(file: TFile) {
        console.log(`[Federation Sync] File deleted: ${file.path}`);
        await this.pushToFederation('DELETE_FILE', file);
    }

    private async handleFileRename(file: TFile, oldPath: string) {
        console.log(`[Federation Sync] File renamed from ${oldPath} to ${file.path}`);
        await this.pushToFederation('RENAME_FILE', file, null, oldPath);
    }

    /**
     * Core function to push updates to the Federation Database.
     * Needs to be implemented with the chosen DB adapter / API client.
     */
    private async pushToFederation(action: string, file: TFile, cache?: any, oldPath?: string) {
        if (!this.settings.databaseUrl) {
            // Setup required
            return;
        }

        try {
            const payload = {
                action,
                vaultName: this.app.vault.getName(),
                filePath: file.path,
                oldPath,
                metadata: cache || null,
                timestamp: Date.now()
            };

            // Execute fetch API to the Federation tech stack
            const targetUrl = this.settings.databaseUrl || 'http://127.0.0.1:3001/ingest/vault';
            await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.apiKey}`
                },
                body: JSON.stringify(payload)
            });
            console.debug(`[Federation Sync] Successfully pushed ${action} for ${file.path}`);
        } catch (error) {
            console.error(`[Federation Sync] Error pushing to Federation DB:`, error);
        }
    }
}

class FederationSyncSettingTab extends PluginSettingTab {
    plugin: FederationSyncPlugin;

    constructor(app: App, plugin: FederationSyncPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();

        containerEl.createEl('h2', {text: 'Federation Sync Settings'});

        new Setting(containerEl)
            .setName('Database Connection URL / API Endpoint')
            .setDesc('The endpoint or connection string for the Federation database.')
            .addText(text => text
                .setPlaceholder('Enter URL')
                .setValue(this.plugin.settings.databaseUrl)
                .onChange(async (value) => {
                    this.plugin.settings.databaseUrl = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('API Key / Auth Token')
            .setDesc('Authentication token required for the Federation database.')
            .addText(text => text
                .setPlaceholder('Enter token')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));
    }
}
