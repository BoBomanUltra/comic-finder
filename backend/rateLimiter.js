const fs = require('fs');
const path = require('path');

const LIMITS = {
    agentA: 100,
    agentB: 10
};

const RATE_LIMIT_FILE = path.join(__dirname, 'rate-limits.json');

function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function loadLimits() {
    try {
        if (fs.existsSync(RATE_LIMIT_FILE)) {
            return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading rate limits:', error);
    }
    return {};
}

function saveLimits(data) {
    try {
        fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving rate limits:', error);
    }
}

function checkAndIncrement(agentType) {
    const today = getTodayKey();
    const limits = loadLimits();
    
    if (!limits[today]) {
        limits[today] = { agentA: 0, agentB: 0 };
    }
    
    const currentCount = limits[today][agentType] || 0;
    const maxLimit = LIMITS[agentType];
    
    if (currentCount >= maxLimit) {
        return {
            allowed: false,
            current: currentCount,
            limit: maxLimit,
            message: `Daily limit reached. Used ${currentCount}/${maxLimit} requests today.`
        };
    }
    
    limits[today][agentType] = currentCount + 1;
    saveLimits(limits);
    
    return {
        allowed: true,
        current: currentCount + 1,
        limit: maxLimit
    };
}

module.exports = { checkAndIncrement };