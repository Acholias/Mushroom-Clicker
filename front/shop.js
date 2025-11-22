let playerName = localStorage.getItem('mushroomPlayerName') || 'Vous';
let currentDifficulty = localStorage.getItem('mushroomDifficulty') || 'facile';
let mushrooms = parseInt(localStorage.getItem('mushroomCount')) || 0;
let cash = parseInt(localStorage.getItem('mushroomCash')) || 300	;
let equippedCosmetic = localStorage.getItem('mushroomCosmetic') || '🍄';
let ownedCosmetics = JSON.parse(localStorage.getItem('mushroomOwnedCosmetics') || '["🍄"]');

// Fonction pour mettre à jour l'affichage du cash
function updateCashDisplay()
{
	const cashDisplay = document.getElementById('shop-cash-display');
	if (cashDisplay) {
		cashDisplay.textContent = cash;
	}
}

function updateCosmeticsUI() {
	document.querySelectorAll('.cosmetic-item').forEach(item => {
		const btn = item.querySelector('.cosmetic-btn');
		const emoji = btn.dataset.emoji || '🍄';
		const price = parseInt(btn.dataset.price) || 0;
		
		if (ownedCosmetics.includes(emoji)) {
			// Cosmétique déjà acheté
			item.classList.remove('locked', 'affordable');
			item.classList.add('purchased');
			
			btn.classList.add('equipped');
			btn.innerHTML = 'Possédé';
		} else {
			// Cosmétique non acheté
			item.classList.remove('purchased');
			
			if (cash >= price) {
				// Assez de cash : vert
				item.classList.remove('locked');
				item.classList.add('affordable');
			} else {
				// Pas assez de cash : gris locked
				item.classList.remove('affordable');
				item.classList.add('locked');
			}
		}
	});
}

// Gestion des onglets
document.addEventListener('DOMContentLoaded', () => {
	// Afficher le cash au chargement
	updateCashDisplay();
	updateCosmeticsUI();
	
	// Bouton retour au jeu
	document.getElementById('back-to-game').addEventListener('click', () => {
		window.location.href = 'mushroom.html';
	});

	// Gestion des onglets
	document.querySelectorAll('.tab-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const tabName = btn.dataset.tab;
			
			// Retirer la classe active de tous les onglets et contenus
			document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
			document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
			
			btn.classList.add('active');
			document.getElementById(`${tabName}-tab`).classList.add('active');
		});
	});

	// Fonction pour afficher le popup d'erreur
	function showErrorPopup() {
		const popup = document.createElement('div');
		popup.className = 'error-popup';
		popup.innerHTML = `
			<div class="error-popup-content">
				<div class="error-icon">❌</div>
				<div class="error-message">Pas assez de cash !</div>
				<div class="error-amount">Il vous faut 50 💵</div>
			</div>
		`;
		
		document.body.appendChild(popup);
		
		setTimeout(() => popup.classList.add('show'), 10);
		setTimeout(() => {
			popup.classList.remove('show');
			setTimeout(() => popup.remove(), 300);
		}, 2000);
	}

	// Gestion de la roue de la fortune
	let isSpinning = false;
	const wheelCost = 50;
	
	document.getElementById('spin-wheel').addEventListener('click', () => {
		if (isSpinning) return;
		
		if (cash < wheelCost) {
			showErrorPopup();
			return;
		}
		
		cash -= wheelCost;
		localStorage.setItem('mushroomCash', cash);
		updateCashDisplay();
		
		// Lancer la roue
		isSpinning = true;
		const wheel = document.getElementById('fortune-wheel');
		const spinButton = document.getElementById('spin-wheel');
		spinButton.disabled = true;
		spinButton.style.opacity = '0.6';
		
		// Rotation aléatoire (entre 5 et 10 tours complets + angle aléatoire)
		const minRotation = 360 * 5;
		const maxRotation = 360 * 10;
		const randomRotation = minRotation + Math.random() * (maxRotation - minRotation);
		const finalRotation = randomRotation + Math.floor(Math.random() * 360);
		
		// Appliquer la rotation
		wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
		wheel.style.transform = `rotate(${finalRotation}deg)`;
		
		setTimeout(() => {
			const normalizedAngle = finalRotation % 360;
			const segmentIndex = Math.floor(normalizedAngle / 45);
			
			setTimeout(() => {
				alert(`Vous avez gagné le segment ${segmentIndex + 1} ! 🎰`);
				
				isSpinning = false;
				spinButton.disabled = false;
				spinButton.style.opacity = '1';
				wheel.style.transition = 'none';
				wheel.style.transform = `rotate(${finalRotation % 360}deg)`;
			}, 300);
		}, 4000);
	});

	document.querySelectorAll('.cosmetic-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			const item = this.closest('.cosmetic-item');
			const emoji = this.dataset.emoji || '🍄';
			const price = parseInt(this.dataset.price) || 0;
			
			if (ownedCosmetics.includes(emoji)) {
				if (emoji === equippedCosmetic) {
					return;
				}
				equippedCosmetic = emoji;
				localStorage.setItem('mushroomCosmetic', emoji);
				updateCosmeticsUI();
				alert('Cosmétique équipé ! ✨');
			}
			else
			{
				if (cash >= price)
				{
					cash -= price;
					localStorage.setItem('mushroomCash', cash);
					ownedCosmetics.push(emoji);
					localStorage.setItem('mushroomOwnedCosmetics', JSON.stringify(ownedCosmetics));
					equippedCosmetic = emoji;
					localStorage.setItem('mushroomCosmetic', emoji);
					updateCashDisplay();
					updateCosmeticsUI();
					alert(`Cosmétique acheté et équipé ! ✨\nIl vous reste ${cash} 💵`);
				} else
					showErrorPopup();
			}
		});
	});
});
