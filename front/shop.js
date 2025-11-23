let playerName = localStorage.getItem('mushroomPlayerName') || 'Vous';
let currentDifficulty = localStorage.getItem('mushroomDifficulty') || 'facile';
let mushrooms = parseInt(localStorage.getItem('mushroomCount')) || 0;
let cash = parseInt(localStorage.getItem('mushroomCash')) || 0	;
let equippedCosmetic = localStorage.getItem('mushroomCosmetic') || '🍄';
let ownedCosmetics = JSON.parse(localStorage.getItem('mushroomOwnedCosmetics') || '["🍄"]');

const wheelRewards = {
  facile: [
    { icon: "💰", label: "Cash +50",    type: "bonus",   action: { cash: 50 } },
    { icon: "🍄", label: "+10% Champignons", type: "bonus",   action: { mushroomsPercent: 10 } },
    { icon: "💎", label: "Cash +35",    type: "bonus",   action: { cash: 35 } },
    { icon: "⚡", label: "+25% Champignons", type: "bonus",   action: { mushroomsPercent: 25 } },
    { icon: "🎁", label: "Cash +25",    type: "bonus",   action: { cash: 25 } },
    { icon: "🌟", label: "+15% Champignons", type: "bonus",   action: { mushroomsPercent: 15 } },
    { icon: "💵", label: "Cash +75",    type: "bonus",   action: { cash: 75 } },
    { icon: "🎰", label: "Cash +120",   type: "bonus",   action: { cash: 120 } }
  ],
  difficile: [
    { icon: "💰", label: "Cash x2",     type: "bonus",   action: { cashMultiplier: 2 } },
    { icon: "🍄", label: "+20% Champignons", type: "bonus",   action: { mushroomsPercent: 20 } },
    { icon: "💎", label: "Cash +90",    type: "bonus",   action: { cash: 90 } },
    { icon: "⚡", label: "+40% Champignons", type: "bonus",   action: { mushroomsPercent: 40 } },
    { icon: "🎁", label: "Cash +60",    type: "bonus",   action: { cash: 60 } },
    { icon: "🌟", label: "+30% Champignons", type: "bonus",   action: { mushroomsPercent: 30 } },
    { icon: "😢", label: "-15% Champignons", type: "malus",   action: { mushroomsPercent: -15 } },
    { icon: "💸", label: "Cash -40",    type: "malus",   action: { cash: -40 } }
  ],
  extreme: [
    { icon: "💰", label: "Cash x2.5",   type: "bonus",   action: { cashMultiplier: 2.5 } },
    { icon: "🍄", label: "+50% Champignons", type: "bonus",   action: { mushroomsPercent: 50 } },
    { icon: "💎", label: "Cash +200",   type: "bonus",   action: { cash: 200 } },
    { icon: "🎁", label: "Cash +150",   type: "bonus",   action: { cash: 150 } },
    { icon: "❌", label: "-40% Champignons", type: "malus",   action: { mushroomsPercent: -40 } },
    { icon: "💸", label: "Cash -80",    type: "malus",   action: { cash: -80 } },
    { icon: "😢", label: "-30% Champignons", type: "malus",   action: { mushroomsPercent: -30 } },
    { icon: "🔻", label: "-35% Cash",   type: "malus",   action: { cashPercent: -35 } }
  ],
  cauchemar: [
    { icon: "🎰", label: "Champignons +100% et Cash x3", type: "bonus", action: { mushroomsPercent: 100, cashMultiplier: 3 } },
    { icon: "❌", label: "-50% Champignons", type: "malus",   action: { mushroomsPercent: -50 } },
    { icon: "💸", label: "Cash -150",   type: "malus",   action: { cash: -150 } },
    { icon: "😢", label: "-60% Champignons", type: "malus",   action: { mushroomsPercent: -60 } },
    { icon: "🔻", label: "-60% Cash",   type: "malus",   action: { cashPercent: -60 } },
    { icon: "💀", label: "-70% Champignons", type: "malus",   action: { mushroomsPercent: -70 } },
    { icon: "⚠️", label: "Cash -200",   type: "malus",   action: { cash: -200 } },
    { icon: "🌩️", label: "-80% Champignons", type: "malus",   action: { mushroomsPercent: -80 } }
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
		const a = reward.action || {};
		if (a.cashMultiplier !== undefined) {
			description = `Cash x${a.cashMultiplier}`;
		} else if (a.cashPercent !== undefined) {
			description = (a.cashPercent > 0 ? `+${a.cashPercent}% 💵` : `${a.cashPercent}% 💵`);
		} else if (a.cash !== undefined) {
			description = a.cash > 0 ? `+${a.cash} 💵` : `${a.cash} 💵`;
		} else if (a.mushroomsPercent !== undefined) {
			description = (a.mushroomsPercent > 0 ? `+${a.mushroomsPercent}% 🍄` : `${a.mushroomsPercent}% 🍄`);
		}

		legendItem.innerHTML = `
			<span class="legend-icon">${reward.icon}</span>
			<div class="legend-text">
				<p class="legend-name">${reward.label}</p>
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
		const a = reward.action || {};
		let beforeCash = cash;
		let beforeMushrooms = mushrooms;

		// Cash multiplier
		if (a.cashMultiplier !== undefined) {
			cash = Math.floor(cash * a.cashMultiplier);
			message += `${reward.icon} ${reward.label}\nIl vous reste ${cash} 💵`;
		}
		// Cash percent
		else if (a.cashPercent !== undefined) {
			let delta = Math.floor(cash * (a.cashPercent / 100));
			cash += delta;
			if (cash < 0) cash = 0;
			message += `${reward.icon} ${reward.label}\nIl vous reste ${cash} 💵`;
		}
		// Cash flat
		else if (a.cash !== undefined) {
			cash += a.cash;
			if (cash < 0) cash = 0;
			message += `${reward.icon} ${reward.label}\nIl vous reste ${cash} 💵`;
		}

		// Mushrooms percent
		else if (a.mushroomsPercent !== undefined) {
			let delta = Math.floor(mushrooms * (a.mushroomsPercent / 100));
			mushrooms += delta;
			if (mushrooms < 0) mushrooms = 0;
			message += `${reward.icon} ${reward.label}\nIl vous reste ${mushrooms} 🍄`;
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
