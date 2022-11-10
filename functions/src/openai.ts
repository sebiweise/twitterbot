import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: 'org-M2OoSkpOEbjRj5UIC2iBiWBu',
    apiKey: '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'
});
export const openai = new OpenAIApi(configuration);