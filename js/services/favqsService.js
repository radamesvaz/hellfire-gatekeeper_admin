import { config } from '../config.js';
import { LocalQuotesService } from './localQuotesService.js';

export class FavQsService {
    constructor() {
        this.baseURL = config.external.favqs.baseURL;
        this.apiKey = config.external.favqs.apiKey;
        this.localQuotesService = new LocalQuotesService();
    }

    /**
     * Get Quote of the Day from FavQs API
     * This endpoint doesn't require authentication
     * @returns {Promise<Object>} Quote object with author and body
     */
    async getQuoteOfTheDay() {
        try {
            const response = await fetch(`${this.baseURL}/qotd`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Return the quote in a clean format
            return {
                author: data.quote.author,
                body: data.quote.body,
                tags: data.quote.tags || [],
                id: data.quote.id,
            };
        } catch (error) {
            console.error('Error fetching quote of the day:', error);
            // Return a local quote if the API fails
            return this.localQuotesService.getRandomQuote();
        }
    }

    /**
     * Get a random quote from FavQs API
     * Requires API key for authenticated requests
     * @returns {Promise<Object>} Random quote object
     */
    async getRandomQuote() {
        try {
            if (!this.apiKey || this.apiKey.trim() === '') {
                return await this.getQuoteOfTheDay();
            }

            const response = await fetch(`${this.baseURL}/quotes/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token token="${this.apiKey}"`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.quotes && data.quotes.length > 0) {
                // Get a random quote from the results
                const randomIndex = Math.floor(Math.random() * data.quotes.length);
                const quote = data.quotes[randomIndex];
                
                return {
                    author: quote.author,
                    body: quote.body,
                    tags: quote.tags || [],
                    id: quote.id,
                };
            } else {
                throw new Error('No quotes found in response');
            }
        } catch (error) {
            console.error('Error fetching random quote:', error);
            // Fallback to local quotes
            return this.localQuotesService.getRandomQuote();
        }
    }

    /**
     * Get quotes by a specific author
     * @param {string} author - Author name to search for
     * @returns {Promise<Object>} Quote object
     */
    async getQuoteByAuthor(author) {
        try {
            if (!this.apiKey || this.apiKey.trim() === '') {
                return await this.getQuoteOfTheDay();
            }

            const response = await fetch(`${this.baseURL}/quotes/?filter=${encodeURIComponent(author)}&type=author`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token token="${this.apiKey}"`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.quotes && data.quotes.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.quotes.length);
                const quote = data.quotes[randomIndex];
                
                return {
                    author: quote.author,
                    body: quote.body,
                    tags: quote.tags || [],
                    id: quote.id,
                };
            } else {
                throw new Error(`No quotes found for author: ${author}`);
            }
        } catch (error) {
            console.error(`Error fetching quote by author ${author}:`, error);
            return this.localQuotesService.getQuoteByAuthor(author);
        }
    }

    /**
     * Format quote for display
     * @param {Object} quote - Quote object
     * @returns {string} Formatted quote string
     */
    formatQuote(quote) {
        if (!quote) return '';
        
        const maxLength = 120;
        let formattedQuote = `"${quote.body}"`;
        
        if (formattedQuote.length > maxLength) {
            formattedQuote = formattedQuote.substring(0, maxLength - 3) + '..."';
        }
        
        return formattedQuote;
    }

    /**
     * Get a motivational quote for the login screen
     * @returns {Promise<Object>} Formatted quote for display
     */
    async getMotivationalQuote() {
        try {
            // Try to get a random quote first, fallback to quote of the day
            const quote = await this.getRandomQuote();
            
            return {
                text: this.formatQuote(quote),
                author: quote.author,
                fullText: quote.body,
                tags: quote.tags,
            };
        } catch (error) {
            console.error('Error getting motivational quote:', error);
            // Ultimate fallback to local quotes
            return this.localQuotesService.getFormattedMotivationalQuote();
        }
    }
}
