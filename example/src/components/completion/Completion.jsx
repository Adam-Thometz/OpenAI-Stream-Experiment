import React from 'react'
import './Completion.css';

import Completion from '../../../../models/Completion';

const CHAT_CONFIG = {
	model: "text-davinci-003",
	temperature: 0,
	maxTokens: 1000,
}

const CompletionExample = () => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [prompt, setPrompt] = React.useState('');
	const [stream, setStream] = React.useState('');

	const handleChange = e => setPrompt(e.target.value);
	const callback = React.useCallback(chunk => setStream(currStream => currStream + chunk), [])

	const chat = React.useMemo(() => {
		const newChat = new Completion(CHAT_CONFIG, callback);
		newChat.setApiKey(import.meta.env.VITE_OPENAI_API_KEY);
		return newChat;
	}, [callback]);

	const handleSubmit = async e => {
		e.preventDefault();
		setIsLoading(true);
		if (stream) setStream('');
		
		try {
			await chat.createResponse(prompt);
		} catch (error) {
			console.error(error)
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="Completion">
			<form className="Completion-prompt-form">
				<label htmlFor="prompt">Enter your prompt: </label>
				<textarea id="prompt" onChange={handleChange} />
				<button disabled={isLoading} type="submit" onClick={handleSubmit}>Generate response</button>
			</form>
			<section className="Completion-stream">
				{stream.split('\n').map((line, i) => (
          <p key={`line-${i+1}`}>{line}</p>
        ))}
			</section>
		</div>
	)
}

export default CompletionExample;
