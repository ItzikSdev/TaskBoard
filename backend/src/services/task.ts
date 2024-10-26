const calculateDescription = (description: string, keywordPresenceScore: number) => {
    let score = keywordPresenceScore;
    const descriptionLength = description.length;

    if (descriptionLength < 10) {
        score += 1;
    } else if (descriptionLength >= 10 && descriptionLength <= 20) {
        score += 2;
    } else if (descriptionLength > 20) {
        score += 3;
    }
    return score;
};

const calculateTitle = (title: string, keywordPresenceScore: number) => {
    let score = keywordPresenceScore;
    const titleLength = title.length;

    if (titleLength < 5) {
        score += 0.5;
    } else if (titleLength >= 5 && titleLength <= 15) {
        score += 1;
    } else if (titleLength > 15) {
        score += 1.5;
    }
    return score;
};

export const calculatePriority = (description: string, title: string, createdAt?: Date) => {
    let keywordsScore = 0;
    const weights = {
        descriptionLength: 0.3,
        titleLength: 0.2,
        keywordPresence: 0.3,
        creationDate: 0.2
    };

    const keywords = [
        { word: "urgent", score: 2 },
        { word: "important", score: 1.5 },
        { word: "low-priority", score: -1 }
    ];

    keywords.forEach(({ word, score }) => {
        if (title.toLowerCase().includes(word) || description.toLowerCase().includes(word)) {
            keywordsScore += (score * weights.keywordPresence);
        }
    });

    const descriptionScore = calculateDescription(description, keywordsScore) * weights.descriptionLength;
    const titleScore = calculateTitle(title, keywordsScore) * weights.titleLength;

    let creationDateScore = 0;
    if (createdAt) {
        const now = new Date();
        const timeDifference = now.getTime() - createdAt.getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (timeDifference <= oneDay) {
            creationDateScore = 1 * weights.creationDate;
        }
    }

    // Calculate total weighted score and normalize
    const maximumWeightedScore = (weights.descriptionLength * 3) + (weights.titleLength * 1.5) + (weights.keywordPresence * 7) + weights.creationDate;
    const totalWeightedScore = (descriptionScore + titleScore + keywordsScore + creationDateScore) / maximumWeightedScore;
    
    // Return a score between 0 and 1
    return Math.min(1, totalWeightedScore);
};
