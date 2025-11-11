const { TextAnalyticsClient, AzureKeyCredential } = require('@azure/ai-text-analytics');

// === KET NOI DEN "NAO" AI ===
const languageKey = process.env.LANG_KEY;
const languageEndpoint = process.env.LANG_ENDPOINT;

// Khởi tạo client để "nói chuyện" với AI
const textAnalyticsClient = new TextAnalyticsClient(languageEndpoint, new AzureKeyCredential(languageKey));
// ============================

// Ham nay se nhan van ban va gui cho AI
async function analyzeText(userText) {
// Tao mot tai lieu de gui di
    const documents = [userText];

    // === SU DUNG CLIENT (CANH BAO SE BIEN MAT) ===
    // Gui tai lieu den AI va cho ket qua
    const results = await textAnalyticsClient.analyzeSentiment(documents);
    // =============================================

    // Kiem tra xem co ket qua va khong bi loi khong
    if (results.length > 0 && !results[0].error) {
        const sentiment = results[0].sentiment; // Lay ket qua (positive/negative/neutral)

        console.log(`Da phan tich thanh cong: ${ sentiment }`);

        // Tra ve mot cau tra loi than thien
        return `Toi phan tich duoc cam xuc cua ban la: ${ sentiment }`;
    } else {
        // Xu ly neu co loi
        console.error('Loi khi phan tich:', results[0].error);
        return 'Xin loi, toi khong the phan tich duoc tin nhan cua ban.';
    }
}
const { ActivityHandler, MessageFactory } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const userText = context.activity.text;
            const response = await analyzeText(userText);
            await context.sendActivity(response);
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
