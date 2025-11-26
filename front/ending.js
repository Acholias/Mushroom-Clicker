
const playerName = localStorage.getItem('mushroomPlayerName') || 'Vous';
const totalMushrooms = localStorage.getItem('mushroomTotalEver') || 0;
const totalClicks = localStorage.getItem('mushroomTotalClicks') || 0;
const startTime = parseInt(localStorage.getItem('mushroomStartTime')) || Date.now();
const equippedCosmetic = localStorage.getItem('mushroomCosmetic') || '🍄';
const ownedCosmetics = JSON.parse(localStorage.getItem('mushroomOwnedCosmetics') || '["🍄"]');

const elapsed = Math.floor((Date.now() - startTime) / 1000);
const minutes = Math.floor(elapsed / 60);
const seconds = elapsed % 60;
const playTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

document.getElementById('ending-player-name').textContent = playerName;
document.getElementById('ending-cosmetic').textContent = equippedCosmetic;
document.getElementById('ending-mushrooms').textContent = formatScore(totalMushrooms);
document.getElementById('ending-clicks').textContent = formatScore(totalClicks);
document.getElementById('ending-playtime').textContent = playTime;

const cosmeticsDiv = document.getElementById('ending-cosmetics');
ownedCosmetics.forEach(cos => {
	const span = document.createElement('span');
	span.className = 'ending-cosmetic-item';
	span.textContent = cos;
	cosmeticsDiv.appendChild(span);
});

document.getElementById('ending-reset-btn').addEventListener('click', function() {
	localStorage.clear();
	window.location.href = 'welcome.html';
});

function formatScore(score)
{
	score = parseInt(score);
	const units = [
		{ value: 1e63, suffix: 'V' },
		{ value: 1e60, suffix: 'Nd' },
		{ value: 1e57, suffix: 'Od' },
		{ value: 1e54, suffix: 'Sd' },
		{ value: 1e51, suffix: 'Sx' },
		{ value: 1e48, suffix: 'Qd' },
		{ value: 1e45, suffix: 'Qt' },
		{ value: 1e42, suffix: 'Td' },
		{ value: 1e39, suffix: 'Dd' },
		{ value: 1e36, suffix: 'Ud' },
		{ value: 1e33, suffix: 'D' },
		{ value: 1e30, suffix: 'N' },
		{ value: 1e27, suffix: 'O' },
		{ value: 1e24, suffix: 'Sp' },
		{ value: 1e21, suffix: 'Sx' },
		{ value: 1e18, suffix: 'Qi' },
		{ value: 1e15, suffix: 'Qa' },
		{ value: 1e12, suffix: 'T' },
		{ value: 1e9, suffix: 'B' },
		{ value: 1e6, suffix: 'M' },
		{ value: 1e3, suffix: 'K' }
	];
	for (let unit of units) {
		if (score >= unit.value) {
			return (score / unit.value).toFixed(2) + ' ' + unit.suffix;
		}
	}
	return Math.floor(score).toString();
}
