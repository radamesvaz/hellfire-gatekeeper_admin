// Local quotes service as fallback when external APIs are not available
export class LocalQuotesService {
    constructor() {
        this.quotes = [
            {
                author: "Walt Disney",
                body: "La forma de empezar es dejar de hablar y empezar a hacer.",
                tags: ["motivación", "acción", "éxito"]
            },
            {
                author: "Steve Jobs",
                body: "La innovación distingue entre un líder y un seguidor.",
                tags: ["innovación", "liderazgo", "tecnología"]
            },
            {
                author: "Albert Einstein",
                body: "La vida es como andar en bicicleta. Para mantener el equilibrio, debes seguir moviéndote.",
                tags: ["vida", "equilibrio", "perseverancia"]
            },
            {
                author: "Maya Angelou",
                body: "Nada puede cambiar la luz que llevas dentro.",
                tags: ["fortaleza", "interior", "esperanza"]
            },
            {
                author: "Nelson Mandela",
                body: "No hay pasión en jugar pequeño, en conformarse con una vida que es menos de la que eres capaz de vivir.",
                tags: ["pasión", "vida", "potencial"]
            },
            {
                author: "Oprah Winfrey",
                body: "El mayor descubrimiento de todos los tiempos es que una persona puede cambiar su futuro simplemente cambiando su actitud.",
                tags: ["actitud", "cambio", "futuro"]
            },
            {
                author: "Winston Churchill",
                body: "El éxito es la capacidad de ir de un fracaso a otro sin perder el entusiasmo.",
                tags: ["éxito", "fracaso", "perseverancia"]
            },
            {
                author: "Eleanor Roosevelt",
                body: "El futuro pertenece a quienes creen en la belleza de sus sueños.",
                tags: ["futuro", "sueños", "creencia"]
            },
            {
                author: "Benjamin Franklin",
                body: "La inversión en conocimiento paga el mejor interés.",
                tags: ["conocimiento", "educación", "inversión"]
            },
            {
                author: "Helen Keller",
                body: "La vida es una aventura atrevida o no es nada.",
                tags: ["vida", "aventura", "valentía"]
            },
            {
                author: "Thomas Edison",
                body: "No he fallado. He encontrado 10,000 formas que no funcionan.",
                tags: ["fracaso", "aprendizaje", "perseverancia"]
            },
            {
                author: "Marie Curie",
                body: "Nada en la vida debe ser temido, solo entendido.",
                tags: ["miedo", "comprensión", "ciencia"]
            },
            {
                author: "Martin Luther King Jr.",
                body: "La oscuridad no puede expulsar a la oscuridad; solo la luz puede hacer eso.",
                tags: ["luz", "oscuridad", "cambio"]
            },
            {
                author: "Mother Teresa",
                body: "No todos podemos hacer grandes cosas, pero podemos hacer cosas pequeñas con gran amor.",
                tags: ["amor", "servicio", "humildad"]
            },
            {
                author: "Confucio",
                body: "Elige un trabajo que ames, y no tendrás que trabajar un día en tu vida.",
                tags: ["trabajo", "pasión", "felicidad"]
            },
            {
                author: "Proverbio",
                body: "La excelencia no es un accidente. Siempre es el resultado de una intención alta, esfuerzo sincero y ejecución inteligente.",
                tags: ["excelencia", "esfuerzo", "intención"]
            },
            {
                author: "Proverbio",
                body: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
                tags: ["éxito", "esfuerzo", "constancia"]
            },
            {
                author: "Proverbio",
                body: "La calidad nunca es un accidente; siempre es el resultado de un esfuerzo inteligente.",
                tags: ["calidad", "esfuerzo", "inteligencia"]
            },
            {
                author: "Proverbio",
                body: "La diferencia entre lo ordinario y lo extraordinario es ese pequeño extra.",
                tags: ["extraordinario", "esfuerzo", "diferencia"]
            },
            {
                author: "Proverbio",
                body: "Cada día es una nueva oportunidad para cambiar tu vida.",
                tags: ["oportunidad", "cambio", "vida"]
            }
        ];
    }

    /**
     * Get a random quote from the local collection
     * @returns {Object} Random quote object
     */
    getRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        return this.quotes[randomIndex];
    }

    /**
     * Get a quote by author
     * @param {string} author - Author name to search for
     * @returns {Object} Quote object or random quote if author not found
     */
    getQuoteByAuthor(author) {
        const authorQuotes = this.quotes.filter(quote => 
            quote.author.toLowerCase().includes(author.toLowerCase())
        );
        
        if (authorQuotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * authorQuotes.length);
            return authorQuotes[randomIndex];
        }
        
        // Fallback to random quote if author not found
        return this.getRandomQuote();
    }

    /**
     * Get a motivational quote (filtered for business/motivation themes)
     * @returns {Object} Motivational quote object
     */
    getMotivationalQuote() {
        const motivationalTags = ['motivación', 'éxito', 'liderazgo', 'esfuerzo', 'perseverancia', 'actitud', 'cambio', 'futuro'];
        
        const motivationalQuotes = this.quotes.filter(quote => 
            quote.tags.some(tag => motivationalTags.includes(tag))
        );
        
        if (motivationalQuotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
            return motivationalQuotes[randomIndex];
        }
        
        // Fallback to random quote
        return this.getRandomQuote();
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
     * Get a formatted motivational quote for the login screen
     * @returns {Object} Formatted quote for display
     */
    getFormattedMotivationalQuote() {
        const quote = this.getMotivationalQuote();
        
        return {
            text: this.formatQuote(quote),
            author: quote.author,
            fullText: quote.body,
            tags: quote.tags,
        };
    }
}
