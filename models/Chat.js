import { BadRequestError, UnauthorizedError } from "../errors";
import { CHAT_MODELS } from "../data/model-options/chatModels";
import parse from "../utils/parse";

class Chat {
  constructor(config, callback) {
    if (!CHAT_MODELS.includes(config.model)) {
      throw new BadRequestError(`
        Unknown model.
        This API supports the following models:
        ${MODEL_OPTIONS.map(model => '- ' + model + '\n')}

        Check the spelling of your input.
        If you feel this is an error, open an issue on our Github repo:
      `);
    }
    this.callback = callback;
    this.decoder = new TextDecoder("utf-8");
    this.API_URL = "https://api.openai.com/v1/chat/completions";

    // API params
    this.model = config.model;
    this.messages = [{
      role: "system",
      content: config.purpose || "You are a helpful assistant"
    }];
    this.maxTokens = config.maxTokens || Infinity;
    this.temperature = config.temperature || 1;
    this.topP = config.topP || 1;
    this.n = config.n || 1;
    this.stop = config.stop || null;
    this.presencePenalty = config.presencePenalty || 0;
    this.frequencyPenalty = config.frequencyPenalty || 0;
    this.logitBias = config.logitBias || {};
    this.user = config.user || '';
    this.apiKey = "";
  }
  

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  updateParam(id, newValue) {
    if (!this[id]) {
      throw new BadRequestError('No such param');
    }
    this[id] = newValue;
  }

  getChatHistory() {
    return this.messages.slice(1);
  }

  async createResponse(prompt) {
    if (!this.apiKey) {
      throw new UnauthorizedError("No API Key has been set! Get your OpenAI API key and pass it into the setApiKey function");
    }
    this.messages.push({ role: "user", content: prompt });
    try {
      const reader = await this._callOpenAI();
      
      let isStreaming = true;
      let response = "";
      while (isStreaming) {
        const { done, value } = await reader.read();
        done
          ? isStreaming = false
          : response += this._addValue(value);
      }
      this.messages.push({ role: "assistant", content: response });
    } catch (e) {
      console.error(e);
    }
  }

  async _callOpenAI() {
    const params = this._getApiParams();
    const response = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        ...params,
        stream: true,
      }),
    });
    return response.body.getReader();
  }

  _addValue(value) {
    const decodedChunk = this.decoder.decode(value);
    const lines = parse(decodedChunk);
  
    let chunk = "";
    for (let line of lines) {
      const { content } = line.choices[0].delta;
      if (content) {
        this.callback(content);
        chunk += content;
      }
    }
    return chunk;
  }

  _getApiParams() {
    return {
      model: this.model,
      messages: this.messages,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      top_p: this.topP,
      n: this.n,
      stop: this.stop,
      presence_penalty: this.presencePenalty,
      frequency_penalty: this.frequencyPenalty,
      logit_bias: this.logitBias,
      user: this.user
    }
  }
}

export default Chat