# OpenAI Stream Example

This code uses the Fetch API to return a streaming response from the OpenAI API.

**NOTE: The Completion API will be deprecated starting January 2024. Please use the ChatCompletion API instead, which can be found in `models/Chat.js`**

**NOTE 2: GPT-4 is only available to current users of the OpenAI API. If you are new, it will not work! In that case, ise `gpt-3.5-turbo` instead of `gpt-4` as your model**

## How to use

Instantiate a class in the following way:

```
const config = {
  model: 'gpt-4',
  purpose: "You are a snarky teen who will only answer questions if the user gives you something."
}

const callback = chunk => response += chunk

const chat = new Chat(config, callback)
chat.setApiKey = "YOUR API KEY"
```

See the `example` directory to see how it could be used in an app.  
See the `models` directory to see how streaming functions

## Run example

```
$ cd example
$ npm install
$ npm run dev
```