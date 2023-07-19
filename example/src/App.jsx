import React from 'react'
import './App.css'
import Completion from './components/completion/Completion';
import Chat from './components/chat/Chat';

const App = () => {
	const [mode, setMode] = React.useState(null);

	const handleSelect = e => setMode(e.target.id);

	const modes = {
		completion: <Completion />,
		chat: <Chat />
	}

	return (
		<div className="App">
			<header>
				<p>Pick one to try</p>
				<div className='App-options'>
					<span onClick={handleSelect} id='completion'>Completion</span>
					<span onClick={handleSelect} id='chat'>Chat</span>
				</div>
			</header>
			{modes[mode]}
		</div>
	)
}

export default App;
