// Environment variables loader for frontend applications
export class EnvLoader {
    constructor() {
        this.envVars = {};
        this.loaded = false;
    }

    /**
     * Load environment variables from .env file
     * @returns {Promise<Object>} Environment variables object
     */
    async loadEnvFile() {
        try {
            const response = await fetch('/.env');
            if (!response.ok) {
                console.warn('No .env file found, using default configuration');
                return {};
            }

            const envText = await response.text();
            return this.parseEnvText(envText);
        } catch (error) {
            console.warn('Could not load .env file:', error);
            return {};
        }
    }

    /**
     * Parse environment variables text
     * @param {string} envText - Raw .env file content
     * @returns {Object} Parsed environment variables
     */
    parseEnvText(envText) {
        const envVars = {};
        const lines = envText.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }

            // Parse KEY=VALUE format
            const equalIndex = trimmedLine.indexOf('=');
            if (equalIndex > 0) {
                const key = trimmedLine.substring(0, equalIndex).trim();
                let value = trimmedLine.substring(equalIndex + 1).trim();
                
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                
                envVars[key] = value;
            }
        }

        return envVars;
    }

    /**
     * Get environment variable value
     * @param {string} key - Environment variable key
     * @param {string} defaultValue - Default value if not found
     * @returns {string} Environment variable value
     */
    getEnvVar(key, defaultValue = '') {
        return this.envVars[key] || defaultValue;
    }

    /**
     * Initialize environment variables
     * @returns {Promise<void>}
     */
    async init() {
        if (this.loaded) {
            return;
        }

        this.envVars = await this.loadEnvFile();
        this.loaded = true;
        
    }

    /**
     * Check if environment variable exists
     * @param {string} key - Environment variable key
     * @returns {boolean} True if variable exists
     */
    hasEnvVar(key) {
        return key in this.envVars && this.envVars[key] !== '';
    }
}

// Create global instance
export const envLoader = new EnvLoader();
