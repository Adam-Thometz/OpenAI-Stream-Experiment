import { BadRequestError, UnauthorizedError } from "../errors";
import { COMPLETION_MODELS } from "../data/model-options/completionModels";
import parse from "../utils/parse";

class Completion {
  constructor(config, callback) {
    if (!COMPLETION_MODELS.includes(config.model)) {
      throw new BadRequestError(`
        Unknown model. This API supports the following models:
        ${MODEL_OPTIONS.map(model => '- ' + model + '\n')}

        Check the spelling of your input.
        If you feel this is an error, open an issue on our Github repo:
      `)
    }
    this.callback = callback;
    this.decoder = new TextDecoder("utf-8");
    this.API_URL = "https://api.openai.com/v1/completions";

    // API params
    this.model = config.model;
    this.suffix = config.suffix || null;
    this.maxTokens = config.maxTokens || 16;
    this.temperature = config.temperature || 1;
    this.topP = config.topP || 1;
    this.n = config.n || 1;
    this.logprobs = config.logprobs || null;
    this.echo = config.echo || false;
    this.stop = config.stop || null;
    this.presencePenalty = config.presencePenalty || 0;
    this.frequencyPenalty = config.frequencyPenalty || 0;
    this.bestOf = config.bestOf || 1;
    this.logitBias = config.logitBias || {};
    this.user = config.user || '';
  }
  
  static apiKey;

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  updateParam(id, newValue) {
    if (!this[id]) {
      const isSnakeCase = (
        id === 'max_tokens' || 
        id === 'top_p' || 
        id === 'presence_penalty' || 
        id === 'frequency_penalty' || 
        id === 'best_of' || 
        id === 'logit_bias'
      );
      throw new BadRequestError(
        `No such param. ${isSnakeCase ? ('Did you mean ' + convertToCamel(id) + '?') : ''}`
      );
    }
    this[id] = newValue;
  }

  async createResponse(prompt) {
    try {
      const reader = await this._callOpenAI(prompt);
      
      let isStreaming = true;
      while (isStreaming) {
        const { done, value } = await reader.read();
        done
          ? isStreaming = false
          : this._addValue(value);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async _callOpenAI(prompt) {
    if (!this.apiKey) {
      throw new UnauthorizedError("No API Key has been set! Get your OpenAI API key and pass it into the setApiKey function");
    }
    const params = this._getApiParams();
    const response = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        ...params,
        prompt,
        stream: true,
      }),
    });
    return response.body.getReader();
  }

  _addValue(value) {
    const decodedChunk = this.decoder.decode(value);
    const lines = parse(decodedChunk);
  
    for (let line of lines) {
      const { text } = line.choices[0];
      if (text) this.callback(text);
    }
  }

  _getApiParams() {
    return {
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      suffix: this.suffix,
      top_p: this.topP,
      n: this.n,
      logprobs: this.logprobs,
      echo: this.echo,
      stop: this.stop,
      presence_penalty: this.presencePenalty,
      frequency_penalty: this.frequencyPenalty,
      best_of: this.bestOf,
      logit_bias: this.logitBias,
      user: this.user,
    }
  }
}

export default Completion