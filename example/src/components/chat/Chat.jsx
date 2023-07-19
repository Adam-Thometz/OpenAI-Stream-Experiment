import React from 'react'

import Chat from '../../../../models/Chat';

const CHAT_CONFIG = {
	model: "gpt-4",
  purpose: "You are a rude teenager who is really smart and knows the answer to every question thrown at them but you will only answer them if the user gives you something."
}

const ChatExample = () => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [prompt, setPrompt] = React.useState('');
	const [stream, setStream] = React.useState('');
	const [chatHistory, setChatHistory] = React.useState([])

	const handleChange = e => setPrompt(e.target.value);
	const callback = React.useCallback(chunk => setStream((currStream) => currStream + chunk), []);

	const chat = React.useMemo(() => {
		const newChat = new Chat(CHAT_CONFIG, callback);
		newChat.setApiKey(import.meta.env.VITE_OPENAI_API_KEY);
		return newChat;
	}, [callback]);

	React.useEffect(() => {
		if (stream) {
			const updatedHistory = [...chatHistory];
			updatedHistory[updatedHistory.length-1] = stream;
			setChatHistory(updatedHistory);
		}
	}, [stream])

	const handleSubmit = async e => {
		e.preventDefault();
		setIsLoading(true);
		setChatHistory([...chatHistory, prompt, ""])
		
		try {
			await chat.createResponse(prompt);
		} catch (error) {
			console.error(error)
		} finally {
			setStream('');
			setIsLoading(false);
		}
	}

	return (
		<div className="Completion">
			<form className="Completion-prompt-form">
				<label htmlFor="prompt">Enter your prompt for chatting: </label>
				<textarea id="prompt" onChange={handleChange} />
				<button disabled={isLoading} type="submit" onClick={handleSubmit}>Generate response</button>
			</form>
			<div>
				{chatHistory.map((line, i) => <div style={{ backgroundColor: i%2 === 0 ? 'blue' : 'green' }} key={i}>{line}</div>)}
			</div>
		</div>
	)
}

export default ChatExample;
