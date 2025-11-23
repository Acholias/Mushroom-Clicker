let playerName = localStorage.getItem('mushroomPlayerName') || 'Vous';
let currentDifficulty = localStorage.getItem('mushroomDifficulty') || 'facile';
let mushrooms = parseInt(localStorage.getItem('mushroomCount')) || 0;
let cash = parseInt(localStorage.getItem('mushroomCash')) || 900	;
let equippedCosmetic = localStorage.getItem('mushroomCosmetic') || '🍄';
let ownedCosmetics = JSON.parse(localStorage.getItem('mushroomOwnedCosmetics') || '["🍄"]');

const wheelRewards = {
	facile: [
		{ type: 'bonus', icon: '💰', name: 'Cash x2', multiplier: 2 },
		{ type: 'bonus', icon: '🍄', name: '+500 Champignons', mushrooms: 500 },
		{ type: 'bonus', icon: '💎', name: '+100 Cash', cash: 100 },
		{ type: 'bonus', icon: '⚡', name: '+1000 Champignons', mushrooms: 1000 },
		{ type: 'bonus', icon: '🎁', name: '+50 Cash', cash: 50 },
		{ type: 'bonus', icon: '🌟', name: '+2000 Champignons', mushrooms: 2000 },
		{ type: 'bonus', icon: '💵', name: '+200 Cash', cash: 200 },
		{ type: 'bonus', icon: '🎰', name: 'JACKPOT +500 Cash', cash: 500 }
	],
	difficile: [
		{ type: 'bonus', icon: '💰', name: 'Cash x2', multiplier: 2 },
		{ type: 'bonus', icon: '🍄', name: '+500 Champignons', mushrooms: 500 },
		{ type: 'bonus', icon: '💎', name: '+100 Cash', cash: 100 },
		{ type: 'bonus', icon: '⚡', name: '+800 Champignons', mushrooms: 800 },
		{ type: 'bonus', icon: '🎁', name: '+50 Cash', cash: 50 },
		{ type: 'bonus', icon: '🌟', name: '+1500 Champignons', mushrooms: 1500 },
		{ type: 'malus', icon: '😢', name: '-100 Champignons', mushrooms: -100 },
		{ type: 'malus', icon: '💸', name: '-20 Cash', cash: -20 }
	],
	extreme: [
		{ type: 'bonus', icon: '💰', name: 'Cash x2', multiplier: 2 },
		{ type: 'bonus', icon: '🍄', name: '+500 Champignons', mushrooms: 500 },
		{ type: 'bonus', icon: '💎', name: '+100 Cash', cash: 100 },
		{ type: 'bonus', icon: '🎁', name: '+50 Cash', cash: 50 },
		{ type: 'malus', icon: '❌', name: '-50% Champignons', mushrooms: -0.5 },
		{ type: 'malus', icon: '💸', name: '-30 Cash', cash: -30 },
		{ type: 'malus', icon: '😢', name: '-200 Champignons', mushrooms: -200 },
		{ type: 'malus', icon: '🔻', name: '-50% Cash', multiplier: 0.5 }
	],
	cauchemar: [
		{ type: 'bonus', icon: '🎰', name: 'JACKPOT +500 Cash', cash: 500 },
		{ type: 'malus', icon: '❌', name: '-50% Champignons', mushrooms: -0.5 },
		{ type: 'malus', icon: '💸', name: '-50 Cash', cash: -50 },
		{ type: 'malus', icon: '😢', name: '-500 Champignons', mushrooms: -500 },
		{ type: 'malus', icon: '🔻', name: '-70% Cash', multiplier: 0.3 },
		{ type: 'malus', icon: '💀', name: '-1000 Champignons', mushrooms: -1000 },
		{ type: 'malus', icon: '⚠️', name: '-80 Cash', cash: -80 },
		{ type: 'malus', icon: '🌩️', name: '-90% Champignons', mushrooms: -0.9 }
	]
};

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

// Fonction pour afficher les icônes sur la roue
function updateWheelIcons() {
	const rewards = wheelRewards[currentDifficulty] || wheelRewards.facile;
	document.querySelectorAll('.segment-icon-overlay').forEach((icon) => {
		const index = parseInt(icon.dataset.index);
		const reward = rewards[index];
		if (reward) {
			icon.textContent = reward.icon;
		}
	});
}

// Fonction pour mettre à jour la légende
function updateLegend() {
	const rewards = wheelRewards[currentDifficulty] || wheelRewards.facile;
	const legendContainer = document.getElementById('legend-items');
	
	if (!legendContainer) return;
	
	legendContainer.innerHTML = '';
	
	rewards.forEach(reward => {
		const legendItem = document.createElement('div');
		legendItem.className = `legend-item ${reward.type}`;
		
		let description = '';
		if (reward.multiplier !== undefined) {
			if (reward.multiplier > 1) {
				description = `Cash x${reward.multiplier}`;
			} else if (reward.multiplier < 1) {
				const percent = Math.round((1 - reward.multiplier) * 100);
				description = `-${percent}% Cash`;
			}
		} else if (reward.cash !== undefined) {
			description = reward.cash > 0 ? `+${reward.cash} 💵` : `${reward.cash} 💵`;
		} else if (reward.mushrooms !== undefined) {
			if (reward.mushrooms > 0) {
				description = `+${reward.mushrooms} 🍄`;
			} else if (reward.mushrooms < 0 && reward.mushrooms > -1) {
				const percent = Math.round(reward.mushrooms * 100);
				description = `${percent}% 🍄`;
			} else {
				description = `${reward.mushrooms} 🍄`;
			}
		}
		
		legendItem.innerHTML = `
			<span class="legend-icon">${reward.icon}</span>
			<div class="legend-text">
				<p class="legend-name">${reward.name}</p>
				<p class="legend-desc">${description}</p>
			</div>
		`;
		
		legendContainer.appendChild(legendItem);
	});
}

// Gestion des onglets
document.addEventListener('DOMContentLoaded', () => {
	// Recharger la difficulté actuelle depuis localStorage
	currentDifficulty = localStorage.getItem('mushroomDifficulty') || 'facile';
	
	// Afficher le cash au chargement
	updateCashDisplay();
	updateCosmeticsUI();
	updateWheelIcons();
	updateLegend();
	
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
	function showErrorPopup(amount = 50) {
		const popup = document.createElement('div');
		popup.className = 'error-popup';
		popup.innerHTML = `
			<div class="error-popup-content">
				<div class="error-icon">❌</div>
				<div class="error-message">Pas assez de cash !</div>
				<div class="error-amount">Il vous faut ${amount} 💵</div>
			</div>
		`;
		
		document.body.appendChild(popup);
		
		setTimeout(() => popup.classList.add('show'), 10);
		setTimeout(() => {
			popup.classList.remove('show');
			setTimeout(() => popup.remove(), 300);
		}, 2000);
	}

	// Fonction pour afficher le popup de récompense
	function showRewardPopup(icon, title, message, isBonus = true) {
		const popup = document.getElementById('reward-popup');
		const popupContent = popup.querySelector('.reward-popup-content');
		const popupIcon = document.getElementById('reward-popup-icon');
		const popupTitle = document.getElementById('reward-popup-title');
		const popupMessage = document.getElementById('reward-popup-message');
		
		// Définir le contenu
		popupIcon.textContent = icon;
		popupTitle.textContent = title;
		popupMessage.textContent = message;
		
		// Ajouter la classe bonus ou malus
		popupContent.classList.remove('bonus', 'malus');
		popupContent.classList.add(isBonus ? 'bonus' : 'malus');
		
		// Afficher le popup
		popup.classList.add('show');
	}

	// Fonction pour fermer le popup de récompense
	function closeRewardPopup() {
		const popup = document.getElementById('reward-popup');
		popup.classList.remove('show');
	}

	// Gérer le clic sur le bouton de fermeture
	document.getElementById('reward-popup-close').addEventListener('click', closeRewardPopup);
	
	// Fermer le popup en cliquant sur l'overlay
	document.querySelector('.reward-popup-overlay').addEventListener('click', closeRewardPopup);

	// Fonction pour appliquer la récompense
	function applyReward(reward) {
		let message = '';
		
		if (reward.multiplier !== undefined) {
			if (reward.multiplier >= 1) {
				// Bonus multiplicateur
				cash = Math.floor(cash * reward.multiplier);
				message = `${reward.icon} ${reward.name}\nVous avez maintenant ${cash} 💵`;
			} else {
				// Malus multiplicateur
				cash = Math.floor(cash * reward.multiplier);
				message = `${reward.icon} ${reward.name}\nIl vous reste ${cash} 💵`;
			}
		} else if (reward.cash !== undefined) {
			if (reward.cash > 0) {
				cash += reward.cash;
				message = `${reward.icon} ${reward.name}\nVous avez maintenant ${cash} 💵`;
			} else {
				cash += reward.cash;
				if (cash < 0) cash = 0;
				message = `${reward.icon} ${reward.name}\nIl vous reste ${cash} 💵`;
			}
		} else if (reward.mushrooms !== undefined) {
			if (reward.mushrooms > 0) {
				mushrooms += reward.mushrooms;
				message = `${reward.icon} ${reward.name}\nVous avez maintenant ${Math.floor(mushrooms)} 🍄`;
			} else if (reward.mushrooms < 0 && reward.mushrooms > -1) {
				// Malus en pourcentage
				mushrooms = Math.floor(mushrooms * (1 + reward.mushrooms));
				message = `${reward.icon} ${reward.name}\nIl vous reste ${Math.floor(mushrooms)} 🍄`;
			} else {
				mushrooms += reward.mushrooms;
				if (mushrooms < 0) mushrooms = 0;
				message = `${reward.icon} ${reward.name}\nIl vous reste ${Math.floor(mushrooms)} 🍄`;
			}
		}
		
		// Sauvegarder les changements
		localStorage.setItem('mushroomCash', cash);
		localStorage.setItem('mushroomCount', mushrooms);
		updateCashDisplay();
		
		return message;
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
		const iconsOverlay = document.getElementById('wheel-icons-overlay');
		const spinButton = document.getElementById('spin-wheel');
		spinButton.disabled = true;
		spinButton.style.opacity = '0.6';
		
		// Rotation aléatoire (entre 5 et 10 tours complets + angle aléatoire)
		const minRotation = 360 * 5;
		const maxRotation = 360 * 10;
		const randomRotation = minRotation + Math.random() * (maxRotation - minRotation);
		const finalRotation = randomRotation + Math.floor(Math.random() * 360);
		
		// Appliquer la rotation à la roue ET aux icônes
		wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
		wheel.style.transform = `rotate(${finalRotation}deg)`;
		iconsOverlay.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
		iconsOverlay.style.transform = `rotate(${finalRotation}deg)`;
		
		setTimeout(() => {
			currentDifficulty = localStorage.getItem('mushroomDifficulty') || 'facile';
			
			let normalizedAngle = finalRotation % 360;
			
			let adjustedAngle = (360 - normalizedAngle) % 360;
			
			adjustedAngle = (adjustedAngle + 360) % 360;
			
			const segmentIndex = Math.floor(adjustedAngle / 45) % 8;
			
			const rewards = wheelRewards[currentDifficulty] || wheelRewards.facile;
			const reward = rewards[segmentIndex];
			
			setTimeout(() => {
				const message = applyReward(reward);
				
				const isBonus = reward.type === 'bonus';
				let title = isBonus ? 'Félicitations ! 🎉' : 'Dommage... 😢';
				showRewardPopup(reward.icon, title, message, isBonus);
				
				isSpinning = false;
				spinButton.disabled = false;
				spinButton.style.opacity = '1';
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
				showRewardPopup('✨', 'Cosmétique équipé !', `Vous avez équipé ${emoji}`, true);
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
					showRewardPopup('🎁', 'Cosmétique acheté !', `Vous avez acheté et équipé ${emoji}\nIl vous reste ${cash} 💵`, true);
				} else
					showErrorPopup(price);
			}
		});
	});
});
