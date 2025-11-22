let selectedDifficulty = 'facile';

function showErrorPopup() {
	const popup = document.createElement('div');
	popup.className = 'error-popup';
	popup.innerHTML = `
		<div class="error-popup-content">
			<div class="error-icon">❌</div>
			<div class="error-message">Veuillez entrer un nom de joueur !</div>
		</div>
	`;
	
	document.body.appendChild(popup);
	
	setTimeout(() => popup.classList.add('show'), 10);
	setTimeout(() => {
		popup.classList.remove('show');
		setTimeout(() => popup.remove(), 300);
	}, 2500);
}

function startGame(playerName, difficulty)
{
	if (!playerName || playerName.trim() === '') {
		showErrorPopup();
		return false;
	}

	const cleanName = playerName.trim().substring(0, 20);

	localStorage.setItem('mushroomPlayerName', cleanName);
	localStorage.setItem('mushroomDifficulty', difficulty);
	window.location.href = 'mushroom.html';
}


function getSavedData()
{
	return {
		playerName: localStorage.getItem('mushroomPlayerName') || '',
		difficulty: localStorage.getItem('mushroomDifficulty') || 'facile'
	};
}

function clearSavedData()
{
	localStorage.removeItem('mushroomPlayerName');
	localStorage.removeItem('mushroomDifficulty');
	localStorage.removeItem('mushroomGameState');
	localStorage.removeItem('mushroomCash');
	localStorage.removeItem('mushroomCosmetic');
	localStorage.removeItem('mushroomOwnedCosmetics');
	localStorage.removeItem('mushroomCount');
	localStorage.removeItem('mushroomTotalEver');
}

document.addEventListener('DOMContentLoaded', () => {

	clearSavedData();

	selectedDifficulty = 'facile';

	document.querySelectorAll('.difficulty-option').forEach(option => {
		option.addEventListener('click', () => {
			document.querySelectorAll('.difficulty-option').forEach(opt => {
				opt.classList.remove('selected');
			});
			option.classList.add('selected');
			selectedDifficulty = option.dataset.difficulty;
		});
	});

	document.getElementById('welcome-form').addEventListener('submit', (e) => {
		e.preventDefault();
		const playerName = document.getElementById('player-name').value;
		startGame(playerName, selectedDifficulty);
	});
});

if (typeof module !== 'undefined' && module.exports)
{
	module.exports = { startGame, getSavedData, clearSavedData };
}
