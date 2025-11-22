/* Faire en sorte que une fois le niveau 10 atteint de nouveau bonus ce débloque encore ou avoir un warden champignon qui se débloque à l'achat
et qui une fois acheter, achète les upgrades à notre place */

const mushroomBtn = document.querySelector('.mushroom-btn-3d');
const counterNumberEl = document.querySelector('.counter-number');
const counterTextEl = document.querySelector('.counter-text');

// Chargement de toutes les données depuis localStorage
let cash = parseInt(localStorage.getItem('mushroomCash')) || 0;
let mushrooms = parseInt(localStorage.getItem('mushroomCount')) || 0;
let clickValue = 1;
let autoIntervalId = null;
let mushroomsPerSecond = 0;

// Récupération des données du localStorage
let playerName = localStorage.getItem('mushroomPlayerName') || 'Vous';
let currentDifficulty = localStorage.getItem('mushroomDifficulty') || 'facile';

// Afficher les infos au chargement
console.log('=== MUSHROOM CLICKER ===');
console.log(`Joueur : ${playerName}`);
console.log(`Difficulté : ${currentDifficulty}`);

const difficultySettings = {
	facile: {
		name: 'Facile',
		icon: '🌱',
		costMultiplier: 1,
		goldMushroomEnabled: true,
		blueMushroomEnabled: true,
		fortuneWheelEnabled: true,
		goldMushroomChance: 0.001,
		blueMushroomChance: 0.002,
		cashChance: 0.015
	},
	difficile: {
		name: 'Difficile',
		icon: '⚡',
		costMultiplier: 2.5,
		goldMushroomEnabled: true,
		blueMushroomEnabled: false,
		fortuneWheelEnabled: false,
		goldMushroomChance: 0.00005,
		blueMushroomChance: 0.00005,
		cashChance: 0.01
	},
	extreme: {
		name: 'Extrême',
		icon: '🔥',
		costMultiplier: 5,
		goldMushroomEnabled: false,
		blueMushroomEnabled: false,
		fortuneWheelEnabled: true,
		goldMushroomChance: 0,
		blueMushroomChance: 0,
		cashChance: 0.01
	},
	cauchemar: {
		name: 'Cauchemar',
		icon: '💀',
		costMultiplier: 10,
		goldMushroomEnabled: false,
		blueMushroomEnabled: false,
		fortuneWheelEnabled: false,
		goldMushroomChance: 0,
		blueMushroomChance: 0,
		cashChance: 0.001
	}
};

// Liste de noms possibles pour générer le leaderboard
const playerNames = [
	'MushroomKing', 'FungiMaster', 'SporeCollector', 'ChampionFarmer', 'MyceliumPro',
	'ToxicShroom', 'GrowthGuru', 'ClickMaster42', 'AutoClicker99', 'ShroomLegend',
	'SporeHunter', 'FungiFanatic', 'ShroomNinja', 'MyceliumWizard', 'CapCollector',
	'GillGuru', 'SporeSamurai', 'FungiPhantom', 'ShroomSorcerer', 'HyphaHero',
	'MyceliumMage', 'ToadstoolTitan', 'FungiWarrior', 'SporeKnight', 'ShroomShaman'
];

// Fonction pour générer un score aléatoire basé sur une distribution réaliste
function generateRandomScore(index, total)
{
	const rank = index + 1;
	const maxScore = 100000000000000000;
	const minScore = 10000000;
	const scoreRange = maxScore - minScore;
	const position = rank / total;
	
	const exponentialFactor = Math.pow(1 - position, 3);
	const baseScore = minScore + (scoreRange * exponentialFactor);
	
	const randomFactor = 0.8 + Math.random() * 0.4;
	const finalScore = Math.floor(baseScore * randomFactor);
	
	return Math.max(minScore, finalScore);
}

// Générer 24 joueurs avec des scores aléatoires (25 avec moi)
function generateLeaderboard() {
	const usedNames = new Set();
	const leaderboard = [];
	
	for (let i = 0; i < 24; i++) {
		let name;
		do {
			name = playerNames[Math.floor(Math.random() * playerNames.length)];
		} while (usedNames.has(name));
		
		usedNames.add(name);
		
		leaderboard.push({
			name: name,
			score: generateRandomScore(i, 24)
		});
	}
	
	// Trier par score décroissant
	leaderboard.sort((a, b) => b.score - a.score);
	
	return leaderboard;
}

// Générer le leaderboard au chargement
const leaderboardData = generateLeaderboard();

// Définition de tous les upgrades
const upgrades = {
	autoClicker: { level: 0, perSecAdd: 2 },
	superFarm: { level: 0, perSecAdd: 15 },
	turboFarm: { level: 0, perSecAdd: 100 },
	megaFarm: { level: 0, perSecAdd: 750 },
	industrialFarm: { level: 0, perSecAdd: 5000 },
	galacticFarm: { level: 0, perSecAdd: 35000 },
	universalFarm: { level: 0, perSecAdd: 250000 },
	divineFarm: { level: 0, perSecAdd: 1500000 },
	etherealFarm: { level: 0, perSecAdd: 10000000 },
	cosmicFarm: { level: 0, perSecAdd: 75000000 },
	infiniteFarm: { level: 0, perSecAdd: 500000000 },
	
	doubleClick: { purchased: false, multiplier: 2, cost: 100 },
	megaBoost: { purchased: false, multiplier: 3, cost: 1000 },
	ultraClick: { purchased: false, multiplier: 5, cost: 10000 },
	godClick: { purchased: false, multiplier: 10, cost: 100000 },
	quantumClick: { purchased: false, multiplier: 25, cost: 1000000 },
	cosmicClick: { purchased: false, multiplier: 50, cost: 10000000 },
	infinityClick: { purchased: false, multiplier: 100, cost: 100000000 }
};

// Charger les upgrades depuis localStorage
const savedUpgrades = localStorage.getItem('mushroomUpgrades');
if (savedUpgrades) {
	const loaded = JSON.parse(savedUpgrades);
	Object.keys(loaded).forEach(key => {
		if (upgrades[key]) {
			upgrades[key] = loaded[key];
		}
	});
}

// Chargement des statistiques
let totalMushroomsEver = parseInt(localStorage.getItem('mushroomTotalEver')) || 0;
let totalClicks = parseInt(localStorage.getItem('mushroomTotalClicks')) || 0;
let startTime = parseInt(localStorage.getItem('mushroomStartTime')) || Date.now();
let recentClicks = [];
let equippedCosmetic = localStorage.getItem('mushroomCosmetic') || '🍄';
let ownedCosmetics = JSON.parse(localStorage.getItem('mushroomOwnedCosmetics') || '["🍄"]');
let goldenBoostActive = false;
let goldenBoostMultiplier = 50;
let goldenBoostEndTime = 0;
let blueBoostActive = false;
let bluePriceReduction = 0.1;
let blueBoostEndTime = 0;

const grades = [
	{ name: 'Spore', icon: '🍄', min: 0, max: 999 },
	{ name: 'Pousse', icon: '🌱', min: 1000, max: 9999 },
	{ name: 'Cueilleur', icon: '🧺', min: 10000, max: 99999 },
	{ name: 'Fermier', icon: '🌳', min: 100000, max: 999999 },
	{ name: 'Cultivateur', icon: '👨‍🌾', min: 1000000, max: 9999999 },
	{ name: 'Jardinier Expert', icon: '🌿', min: 10000000, max: 99999999 },
	{ name: 'Botaniste', icon: '🔬', min: 100000000, max: 999999999 },
	{ name: 'Mycologue', icon: '🎓', min: 1000000000, max: 9999999999 },
	{ name: 'Maître Fermier', icon: '👑', min: 10000000000, max: 99999999999 },
	{ name: 'Seigneur Champignon', icon: '🏰', min: 100000000000, max: 999999999999 },
	{ name: 'Roi des Spores', icon: '👑', min: 1000000000000, max: 9999999999999 },
	{ name: 'Empereur Fongique', icon: '⚜️', min: 10000000000000, max: 99999999999999 },
	{ name: 'Dieu Champignon', icon: '✨', min: 100000000000000, max: 999999999999999 },
	{ name: 'Titan Mycélium', icon: '🌌', min: 1000000000000000, max: 9999999999999999 },
	{ name: 'Créateur Universel', icon: '🌟', min: 10000000000000000, max: 99999999999999999 },
	{ name: 'Divinité Éternelle', icon: '💫', min: 100000000000000000, max: 999999999999999999 },
	{ name: 'Transcendant', icon: '🔮', min: 1000000000000000000, max: 9999999999999999999 },
	{ name: 'Entité Cosmique', icon: '🌠', min: 10000000000000000000, max: 99999999999999999999 },
	{ name: 'Omnipotent', icon: '♾️', min: 100000000000000000000, max: Infinity }
];

// Fonction pour sauvegarder toutes les données dans localStorage
function saveGameData() {
	localStorage.setItem('mushroomCount', mushrooms.toString());
	localStorage.setItem('mushroomCash', cash.toString());
	localStorage.setItem('mushroomTotalEver', totalMushroomsEver.toString());
	localStorage.setItem('mushroomTotalClicks', totalClicks.toString());
	localStorage.setItem('mushroomStartTime', startTime.toString());
	localStorage.setItem('mushroomCosmetic', equippedCosmetic);
	localStorage.setItem('mushroomOwnedCosmetics', JSON.stringify(ownedCosmetics));
	localStorage.setItem('mushroomUpgrades', JSON.stringify(upgrades));
}

// Sauvegarder automatiquement toutes les secondes
let autoSaveInterval = setInterval(saveGameData, 1000);

// Fonction pour recalculer clickValue basé sur les upgrades
function recalculateClickValue() {
	clickValue = 1;
	if (upgrades.doubleClick.purchased) clickValue *= 2;
	if (upgrades.megaBoost.purchased) clickValue *= 3;
	if (upgrades.ultraClick.purchased) clickValue *= 5;
	if (upgrades.godClick.purchased) clickValue *= 10;
	if (upgrades.quantumClick.purchased) clickValue *= 25;
	if (upgrades.cosmicClick.purchased) clickValue *= 50;
	if (upgrades.infinityClick.purchased) clickValue *= 100;
}

function updateCosmeticDisplay()
{
	document.querySelectorAll('.mushroom-icon').forEach(icon => {
		icon.textContent = equippedCosmetic;
	});
}

// Recalculer au chargement
recalculateClickValue();
updateCosmeticDisplay();

// Redémarrer la production automatique si des upgrades sont présents
if (upgrades.autoClicker.level > 0 || upgrades.superFarm.level > 0 || 
    upgrades.turboFarm.level > 0 || upgrades.megaFarm.level > 0 ||
    upgrades.industrialFarm.level > 0 || upgrades.galacticFarm.level > 0 ||
    upgrades.universalFarm.level > 0 || upgrades.divineFarm.level > 0 ||
    upgrades.etherealFarm.level > 0 || upgrades.cosmicFarm.level > 0 ||
    upgrades.infiniteFarm.level > 0) {
	startAutoProduction();
}

const baseUpgradeCosts = {
	'auto-clicker-btn': 50,
	'super-farm-btn': 500,
	'turbo-farm-btn': 5000,
	'mega-farm-btn': 50000,
	'industrial-farm-btn': 500000,
	'galactic-farm-btn': 5000000,
	'universal-farm-btn': 50000000,
	'divine-farm-btn': 500000000,
	'ethereal-farm-btn': 5000000000,
	'cosmic-farm-btn': 50000000000,
	'infinite-farm-btn': 500000000000,
	'double-click-btn': 100,
	'mega-boost-btn': 1000,
	'ultra-click-btn': 10000,
	'god-click-btn': 100000,
	'quantum-click-btn': 1000000,
	'cosmic-click-btn': 10000000,
	'infinity-click-btn': 100000000
};

function getUpgradeCost(upgradeId)
{
	const baseCost = baseUpgradeCosts[upgradeId];
	const multiplier = difficultySettings[currentDifficulty].costMultiplier;
	const finalCost = Math.floor(baseCost * multiplier);
	
	if (blueBoostActive)
		return Math.floor(finalCost * bluePriceReduction);
	
	return finalCost;
}

mushroomBtn.addEventListener("click", onMushroomClick);

document.querySelectorAll('.upgrade-btn').forEach(btn => {
	btn.addEventListener('click', () => buyUpgrade(btn.id));
});

document.getElementById('shop-btn').addEventListener('click', () => {
	saveGameData();
	window.location.href = 'shop.html';
});

// Fonction pour afficher le popup de confirmation de reset
function showResetConfirmation() {
	const popup = document.createElement('div');
	popup.className = 'reset-confirmation-popup';
	popup.innerHTML = `
		<div class="reset-popup-overlay"></div>
		<div class="reset-popup-content">
			<div class="reset-warning-icon">⚠️</div>
			<div class="reset-title">Réinitialiser le jeu ?</div>
			<div class="reset-message">Toutes vos données seront perdues définitivement !</div>
			<div class="reset-buttons">
				<button class="reset-confirm-btn" id="confirm-reset">
					<span class="btn-icon">✓</span>
					<span class="btn-text">Confirmer</span>
				</button>
				<button class="reset-cancel-btn" id="cancel-reset">
					<span class="btn-icon">✕</span>
					<span class="btn-text">Annuler</span>
				</button>
			</div>
		</div>
	`;
	
	document.body.appendChild(popup);
	
	setTimeout(() => popup.classList.add('show'), 10);
	
	// Bouton Confirmer
	document.getElementById('confirm-reset').addEventListener('click', () => {
		popup.classList.remove('show');
		setTimeout(() => {
			popup.remove();
			performReset();
		}, 300);
	});
	
	// Bouton Annuler
	document.getElementById('cancel-reset').addEventListener('click', () => {
		popup.classList.remove('show');
		setTimeout(() => popup.remove(), 300);
	});
	
	// Clic sur l'overlay pour fermer
	popup.querySelector('.reset-popup-overlay').addEventListener('click', () => {
		popup.classList.remove('show');
		setTimeout(() => popup.remove(), 300);
	});
}

// Fonction pour effectuer le reset
function performReset() {
	// Arrêter la sauvegarde automatique
	clearInterval(autoSaveInterval);
	
	// Arrêter la production automatique
	if (autoIntervalId) {
		clearInterval(autoIntervalId);
	}
	
	// Vider complètement le localStorage
	localStorage.clear();
	
	// Vérifier que tout est bien supprimé
	console.log('localStorage après clear:', localStorage.length);
	
	// Rediriger immédiatement
	setTimeout(() => {
		window.location.href = 'welcome.html';
	}, 100);
}

// Bouton RESET - Affiche le popup de confirmation
document.getElementById('reset-btn').addEventListener('click', () => {
	showResetConfirmation();
});

function updateCounterDisplay()
{
	counterNumberEl.textContent = formatScore(mushrooms);
	counterTextEl.textContent = mushrooms === 1 ? 'mushroom' : 'mushrooms';
	updateUpgradeButtons();
	updateStats();
	updateGrade();
}

function updateUpgradeButtons()
{
	document.querySelectorAll('.upgrade-btn').forEach(btn => {
		const cost = getUpgradeCost(btn.id);
		const isClickMultiplier = btn.id.includes('click') || btn.id.includes('boost');
		const upgradeKey = btn.id.replace('-btn', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
		
		const costValueEl = btn.querySelector('.cost-value');
		if (costValueEl) {
			costValueEl.textContent = formatScore(cost);
		}
		
		if (isClickMultiplier && upgrades[upgradeKey]?.purchased) {
			btn.disabled = true;
		} else {
			btn.disabled = mushrooms < cost;
		}
	});
}

function onMushroomClick()
{
	const finalClickValue = goldenBoostActive ? clickValue * goldenBoostMultiplier : clickValue;
	mushrooms += finalClickValue;
	totalMushroomsEver += finalClickValue;
	totalClicks++;
	
	recentClicks.push({ time: Date.now(), value: finalClickValue });
	
	updateCounterDisplay();
}

function buyUpgrade(btnId)
{
	const cost = getUpgradeCost(btnId);
	const upgradeKey = btnId.replace('-btn', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
	
	// Vérifier si l'upgrade à usage unique est déjà acheté
	const isClickMultiplier = btnId.includes('click') || btnId.includes('boost');
	if (isClickMultiplier && upgrades[upgradeKey]?.purchased) return;
	
	if (mushrooms < cost) return;
	
	if (btnId === 'auto-clicker-btn') {
		mushrooms -= cost;
		upgrades.autoClicker.level++;
		startAutoProduction();
	}
	else if (btnId === 'super-farm-btn') {
		mushrooms -= cost;
		upgrades.superFarm.level++;
		startAutoProduction();
	}
	else if (btnId === 'turbo-farm-btn') {
		mushrooms -= cost;
		upgrades.turboFarm.level++;
		startAutoProduction();
	}
	else if (btnId === 'mega-farm-btn') {
		mushrooms -= cost;
		upgrades.megaFarm.level++;
		startAutoProduction();
	}
	else if (btnId === 'industrial-farm-btn') {
		mushrooms -= cost;
		upgrades.industrialFarm.level++;
		startAutoProduction();
	}
	else if (btnId === 'galactic-farm-btn') {
		mushrooms -= cost;
		upgrades.galacticFarm.level++;
		startAutoProduction();
	}
	else if (btnId === 'universal-farm-btn') {
		mushrooms -= cost;
		upgrades.universalFarm.level++;
		startAutoProduction();
	}
	else if (btnId === 'divine-farm-btn') {
		mushrooms -= cost;
		upgrades.divineFarm.level++;
		startAutoProduction();
	}
	else if (btnId === 'double-click-btn' && !upgrades.doubleClick.purchased) {
		mushrooms -= cost;
		upgrades.doubleClick.purchased = true;
		clickValue *= 2;
	}
	else if (btnId === 'mega-boost-btn' && !upgrades.megaBoost.purchased) {
		mushrooms -= cost;
		upgrades.megaBoost.purchased = true;
		clickValue *= 3;
	}
	else if (btnId === 'ultra-click-btn' && !upgrades.ultraClick.purchased) {
		mushrooms -= cost;
		upgrades.ultraClick.purchased = true;
		clickValue *= 5;
	}
	else if (btnId === 'god-click-btn' && !upgrades.godClick.purchased) {
		mushrooms -= cost;
		upgrades.godClick.purchased = true;
		clickValue *= 10;
	}
	else if (btnId === 'quantum-click-btn' && !upgrades.quantumClick.purchased) {
		mushrooms -= cost;
		upgrades.quantumClick.purchased = true;
		clickValue *= 25;
	}
	else if (btnId === 'cosmic-click-btn' && !upgrades.cosmicClick.purchased) {
		mushrooms -= cost;
		upgrades.cosmicClick.purchased = true;
		clickValue *= 50;
	}
	else if (btnId === 'infinity-click-btn' && !upgrades.infinityClick.purchased) {
		mushrooms -= cost;
		upgrades.infinityClick.purchased = true;
		clickValue *= 100;
	}
	else if (btnId === 'ethereal-farm-btn') {
		mushrooms -= cost;
		upgrades.etherealFarm.level++;
		startAutoProduction();
	}
	else if (btnId === 'cosmic-farm-btn') {
		mushrooms -= cost;
		upgrades.cosmicFarm.level++;
		startAutoProduction();
	}
	else if (btnId === 'infinite-farm-btn') {
		mushrooms -= cost;
		upgrades.infiniteFarm.level++;
		startAutoProduction();
	}
	updateCounterDisplay();
	saveGameData(); // Sauvegarder après chaque achat
}

function startAutoProduction()
{
	if (!autoIntervalId) {
		autoIntervalId = setInterval(() => {
		mushroomsPerSecond = 
			upgrades.autoClicker.level * upgrades.autoClicker.perSecAdd +
			upgrades.superFarm.level * upgrades.superFarm.perSecAdd +
			upgrades.turboFarm.level * upgrades.turboFarm.perSecAdd +
			upgrades.megaFarm.level * upgrades.megaFarm.perSecAdd +
			upgrades.industrialFarm.level * upgrades.industrialFarm.perSecAdd +
			upgrades.galacticFarm.level * upgrades.galacticFarm.perSecAdd +
			upgrades.universalFarm.level * upgrades.universalFarm.perSecAdd +
			upgrades.divineFarm.level * upgrades.divineFarm.perSecAdd +
			upgrades.etherealFarm.level * upgrades.etherealFarm.perSecAdd +
			upgrades.cosmicFarm.level * upgrades.cosmicFarm.perSecAdd +
			upgrades.infiniteFarm.level * upgrades.infiniteFarm.perSecAdd;
			
			// Appliquer le boost bleu si actif
			const finalMushroomsPerSecond = blueBoostActive ? mushroomsPerSecond * blueBoostMultiplier : mushroomsPerSecond;
			mushrooms += finalMushroomsPerSecond;
			totalMushroomsEver += finalMushroomsPerSecond;
			updateCounterDisplay();
		}, 1000);
	}
}

updateUpgradeButtons();

// Fonction pour créer des champignons qui tombent du ciel
function createFallingMushroom()
{
	const mushroom = document.createElement('div');
	const settings = difficultySettings[currentDifficulty];
	
	// % de chance d'avoir un champignon doré, bleu ou du cash selon la difficulté
	const isGolden = settings.goldMushroomEnabled && Math.random() < settings.goldMushroomChance;
	const isBlue = !isGolden && settings.blueMushroomEnabled && Math.random() < settings.blueMushroomChance;
	const isCash = !isGolden && !isBlue && Math.random() < settings.cashChance;
	
	if (isGolden) {
		mushroom.className = 'falling-mushroom golden-mushroom';
		mushroom.textContent = '🍄';
		mushroom.style.cursor = 'pointer';
		
		// Événement de clic sur le champignon doré
		mushroom.addEventListener('click', (e) => {
			e.stopPropagation();
			activateGoldenBoost();
			mushroom.remove();
			createGoldenParticles();
		});
	} else if (isBlue) {
		mushroom.className = 'falling-mushroom blue-mushroom';
		mushroom.textContent = '🍄';
		mushroom.style.cursor = 'pointer';
		
		mushroom.addEventListener('click', (e) => {
			e.stopPropagation();
			activateBlueBoost();
			mushroom.remove();
			createBlueParticles();
		});
	} else if (isCash) {
		// Cash qui tombe du ciel
		mushroom.className = 'falling-mushroom cash-item';
		mushroom.textContent = '💵';
		mushroom.style.cursor = 'pointer';
		
		// Événement de clic sur le cash
		mushroom.addEventListener('click', (e) => {
			e.stopPropagation();
			const cashAmount = Math.floor(Math.random() * 5) + 1; // 1 à 5 cash
			cash += cashAmount;
			localStorage.setItem('mushroomCash', cash.toString());
			updateCashDisplay();
			mushroom.remove();
			createCashParticles(cashAmount);
		});
	} else {
		mushroom.className = 'falling-mushroom';
		mushroom.textContent = '🍄';
	}
	
	// Position aléatoire horizontale
	mushroom.style.left = Math.random() * 100 + '%';
	
	const duration = isGolden ? 8 + Math.random() * 4 : (isBlue ? 7 + Math.random() * 3 : (isCash ? 5 + Math.random() * 2 : 3 + Math.random() * 3));
	mushroom.style.animationDuration = duration + 's';
		// Taille aléatoire (plus gros si doré, bleu ou cash)
	const size = (isGolden || isBlue || isCash) ? 40 + Math.random() * 20 : 20 + Math.random() * 20;
	mushroom.style.fontSize = size + 'px';
	
	document.getElementById('falling-mushrooms').appendChild(mushroom);
	
	// Supprimer le champignon après qu'il soit tombé en dehors de l'écran
	setTimeout(() => {
		mushroom.remove();
	}, duration * 1000);
}

// fonction pour activer le golden mushroom
function activateGoldenBoost()
{
	if (goldenBoostActive) {
		// Si déjà actif, prolonger de 5 secondes
		goldenBoostEndTime = Date.now() + 5000;
	}
	else
	{
		goldenBoostActive = true;
		goldenBoostEndTime = Date.now() + 5000;
		
		// Créer l'indicateur visuel
		const boostIndicator = document.createElement('div');
		boostIndicator.id = 'golden-boost-indicator';
		boostIndicator.innerHTML = `
			<div class="boost-icon">🌟</div>
			<div class="boost-text">
				<div class="boost-title">BOOST DORÉ x50!</div>
				<div class="boost-timer" id="boost-timer">5.0s</div>
			</div>
		`;
		document.body.appendChild(boostIndicator);
		
		// Créer des particules dorées
		createGoldenParticles();
		
		// Timer pour mettre à jour le compteur
		const timerInterval = setInterval(() => {
			const remaining = Math.max(0, (goldenBoostEndTime - Date.now()) / 1000);
			const timerEl = document.getElementById('boost-timer');
			if (timerEl) {
				timerEl.textContent = remaining.toFixed(1) + 's';
			}
			
			if (remaining <= 0) {
				clearInterval(timerInterval);
				goldenBoostActive = false;
				const indicator = document.getElementById('golden-boost-indicator');
				if (indicator) {
					indicator.classList.add('fade-out');
					setTimeout(() => indicator.remove(), 500);
				}
			}
		}, 100);
	}
}

// Fonction pour créer des particules dorées
function createGoldenParticles()
{
	const colors = ['#fbbf24', '#fcd34d', '#fde047', '#facc15'];
	const container = document.getElementById('falling-mushrooms');
	
	for (let i = 0; i < 30; i++) {
		setTimeout(() => {
			const particle = document.createElement('div');
			particle.className = 'golden-particle';
			particle.style.left = 50 + (Math.random() - 0.5) * 30 + '%';
			particle.style.top = 50 + (Math.random() - 0.5) * 30 + '%';
			particle.style.background = colors[Math.floor(Math.random() * colors.length)];
			
			const angle = Math.random() * Math.PI * 2;
			const velocity = 100 + Math.random() * 100;
			const vx = Math.cos(angle) * velocity;
			const vy = Math.sin(angle) * velocity;
			
			particle.style.setProperty('--vx', vx + 'px');
			particle.style.setProperty('--vy', vy + 'px');
			
			container.appendChild(particle);
			
			setTimeout(() => particle.remove(), 1000);
		}, i * 20);
	}
}

// Fonction pour activer le boost bleu (braderie)
function activateBlueBoost()
{
	if (blueBoostActive) {
		blueBoostEndTime = Date.now() + 5000;
	}
	else
	{
		blueBoostActive = true;
		blueBoostEndTime = Date.now() + 5000;
		
		// Créer l'indicateur visuel
		const boostIndicator = document.createElement('div');
		boostIndicator.id = 'blue-boost-indicator';
		boostIndicator.innerHTML = `
			<div class="boost-icon">💎</div>
			<div class="boost-text">
				<div class="boost-title">BRADERIE -90% !</div>
				<div class="boost-timer" id="blue-boost-timer">5.0s</div>
			</div>
		`;
		document.body.appendChild(boostIndicator);
		
		createBlueParticles();
		updateUpgradeButtons();
		
		const timerInterval = setInterval(() => {
			const remaining = Math.max(0, (blueBoostEndTime - Date.now()) / 1000);
			const timerEl = document.getElementById('blue-boost-timer');
			if (timerEl) {
				timerEl.textContent = remaining.toFixed(1) + 's';
			}
			
			if (remaining <= 0) {
				clearInterval(timerInterval);
				blueBoostActive = false;
				updateUpgradeButtons();
				const indicator = document.getElementById('blue-boost-indicator');
				if (indicator) {
					indicator.classList.add('fade-out');
					setTimeout(() => indicator.remove(), 500);
				}
			}
		}, 100);
	}
}

// Fonction pour créer des particules bleues
function createBlueParticles()
{
	const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb'];
	const container = document.getElementById('falling-mushrooms');
	
	for (let i = 0; i < 30; i++) {
		setTimeout(() => {
			const particle = document.createElement('div');
			particle.className = 'blue-particle';
			particle.style.left = 50 + (Math.random() - 0.5) * 30 + '%';
			particle.style.top = 50 + (Math.random() - 0.5) * 30 + '%';
			particle.style.background = colors[Math.floor(Math.random() * colors.length)];
			
			const angle = Math.random() * Math.PI * 2;
			const velocity = 100 + Math.random() * 100;
			const vx = Math.cos(angle) * velocity;
			const vy = Math.sin(angle) * velocity;
			
			particle.style.setProperty('--vx', vx + 'px');
			particle.style.setProperty('--vy', vy + 'px');
			
			container.appendChild(particle);
			
			setTimeout(() => particle.remove(), 1000);
		}, i * 20);
	}
}

// Fonction pour créer des particules de cash
function createCashParticles(amount)
{
	const colors = ['#22c55e', '#16a34a', '#15803d', '#14532d'];
	const container = document.getElementById('falling-mushrooms');
	
	for (let i = 0; i < 20; i++) {
		setTimeout(() => {
			const particle = document.createElement('div');
			particle.className = 'cash-particle';
			particle.style.left = 50 + (Math.random() - 0.5) * 30 + '%';
			particle.style.top = 50 + (Math.random() - 0.5) * 30 + '%';
			particle.style.background = colors[Math.floor(Math.random() * colors.length)];
			
			const angle = Math.random() * Math.PI * 2;
			const velocity = 80 + Math.random() * 80;
			const vx = Math.cos(angle) * velocity;
			const vy = Math.sin(angle) * velocity;
			
			particle.style.setProperty('--vx', vx + 'px');
			particle.style.setProperty('--vy', vy + 'px');
			
			container.appendChild(particle);
			
			setTimeout(() => particle.remove(), 1000);
		}, i * 15);
	}
	
	// Afficher le montant gagné
	const amountDisplay = document.createElement('div');
	amountDisplay.className = 'cash-amount-display';
	amountDisplay.textContent = '+' + amount + ' 💵';
	amountDisplay.style.left = '50%';
	amountDisplay.style.top = '50%';
	container.appendChild(amountDisplay);
	setTimeout(() => amountDisplay.remove(), 1500);
}

// Fonction pour mettre à jour l'affichage du cash
function updateCashDisplay()
{
	const cashDisplay = document.getElementById('cash-display');
	if (cashDisplay) {
		cashDisplay.textContent = cash;
	}
}

// Créer des champignons de manière régulière qui tombe du ciel
setInterval(createFallingMushroom, 300);

function updateStats()
{
	document.getElementById('total-mushrooms').textContent = formatScore(totalMushroomsEver);
	
	const now = Date.now();
	
	recentClicks = recentClicks.filter(click => now - click.time < 3000);
	
	const manualInLast3Sec = recentClicks.reduce((sum, click) => sum + click.value, 0);
	const manualPerSec = manualInLast3Sec / 3;
	
	const totalPerSec = Math.round((mushroomsPerSecond + manualPerSec) * 10) / 10;
	document.getElementById('mushrooms-per-sec').textContent = formatScore(totalPerSec);
	document.getElementById('total-clicks').textContent = formatScore(totalClicks);	
	const elapsed = Math.floor((Date.now() - startTime) / 1000);
	const minutes = Math.floor(elapsed / 60);
	const seconds = elapsed % 60;
	document.getElementById('play-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
	updateLeaderboard();
}

const gradeDescriptions = [
	"Vous débutez votre aventure champignonnesque ! Continuez à récolter.",
	"Votre première pousse apparaît ! La cultivation devient sérieuse.",
	"Un cueilleur prometteur ! Vos compétences se développent rapidement.",
	"Vous maîtrisez l'art de la ferme ! Les champignons poussent sous vos doigts.",
	"Expert en cultivation ! Votre réputation grandit dans le royaume fongique.",
	"Les secrets du jardinage n'ont plus de secrets pour vous !",
	"Botaniste reconnu ! Vous comprenez la science derrière chaque spore.",
	"Mycologue certifié ! Votre expertise est légendaire.",
	"Le titre de Maître ! Peu peuvent rivaliser avec votre savoir-faire.",
	"Seigneur absolu des champignons ! Votre domaine s'étend à perte de vue.",
	"Royauté fongique ! Les spores se prosternent devant vous.",
	"Empereur des mycéliums ! Votre empire s'étend sur des continents entiers.",
	"Divinité champignonnesque ! Votre pouvoir transcende la réalité.",
	"Titan des spores ! Vous êtes devenu une force de la nature.",
	"Créateur universel ! Les champignons existent grâce à votre volonté.",
	"Divinité éternelle ! Votre légende traversera les âges.",
	"Vous avez transcendé l'existence mortelle. Rien ne vous arrête.",
	"Entité cosmique ! Votre conscience embrasse l'univers entier.",
	"Omnipotent ! Vous avez atteint le sommet absolu de l'existence fongique !"
];

let previousGradeIndex = 0;

function updateGrade()
{
	const currentGrade = grades.find(g => totalMushroomsEver >= g.min && totalMushroomsEver <= g.max);
	const gradeIndex = grades.indexOf(currentGrade);
	const nextGrade = grades[gradeIndex + 1];
	
	// Vérifier si on a changé de grade
	if (gradeIndex > previousGradeIndex) {
		createFireworks();
		previousGradeIndex = gradeIndex;
	}
	
	document.getElementById('grade-icon').textContent = currentGrade.icon;
	document.getElementById('grade-title').textContent = currentGrade.name;
	document.getElementById('grade-level').textContent = gradeIndex + 1;
	document.getElementById('grade-description').textContent = gradeDescriptions[gradeIndex];
	
	const progressBar = document.getElementById('grade-progress');
	
	if (nextGrade)
	{
		const progress = ((totalMushroomsEver - currentGrade.min) / (nextGrade.min - currentGrade.min)) * 100;
		const clampedProgress = Math.min(progress, 100);
		progressBar.style.width = clampedProgress + '%';
		document.getElementById('grade-percentage').textContent = Math.floor(clampedProgress) + '%';
		
		// Changer la couleur en fonction de la progression
		let color, shadowColor;
		if (clampedProgress < 20) {
			color = '#22c55e'; // Vert
			shadowColor = 'rgba(34, 197, 94, 0.6)';
		} else if (clampedProgress < 40) {
			color = '#84cc16'; // Jaune-vert
			shadowColor = 'rgba(132, 204, 22, 0.6)';
		} else if (clampedProgress < 60) {
			color = '#eab308'; // Jaune
			shadowColor = 'rgba(234, 179, 8, 0.6)';
		} else if (clampedProgress < 80) {
			color = '#f97316'; // Orange
			shadowColor = 'rgba(249, 115, 22, 0.6)';
		} else {
			color = '#ef4444'; // Rouge
			shadowColor = 'rgba(239, 68, 68, 0.6)';
		}
		
		progressBar.style.backgroundColor = color;
		progressBar.style.boxShadow = `0 0 15px ${shadowColor}, inset 0 2px 3px rgba(255, 255, 255, 0.4), inset 0 -2px 3px rgba(0, 0, 0, 0.3)`;
		
		document.getElementById('grade-next').textContent = `Prochain: ${nextGrade.name} (${formatScore(nextGrade.min)})`;
	}
	else
	{
		progressBar.style.width = '100%';
		progressBar.style.backgroundColor = '#dc2626';
		progressBar.style.boxShadow = '0 0 15px rgba(220, 38, 38, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.4), inset 0 -2px 3px rgba(0, 0, 0, 0.3)';
		document.getElementById('grade-next').textContent = 'Grade Maximum !';
		document.getElementById('grade-percentage').textContent = '100%';
	}
}

// Mettre à jour toutes les stats toutes les secondes
setInterval(updateStats, 1000);
updateStats();
updateGrade();
updateCounterDisplay(); // Mettre à jour l'affichage des mushrooms au chargement

document.addEventListener('DOMContentLoaded', () => {
	updateCashDisplay();
});

// Gestion du flip du panneau
const panelFlip = document.getElementById('panel-flip');
const flipToLeaderboard = document.getElementById('flip-to-leaderboard');
const flipToGrade = document.getElementById('flip-to-grade');

flipToLeaderboard.addEventListener('click', () => {
	panelFlip.classList.add('flipped');
});

flipToGrade.addEventListener('click', () => {
	panelFlip.classList.remove('flipped');
});

// Fonction pour formater les scores avec toutes les unités
function formatScore(score) {
	const units = [
		{ value: 1e63, suffix: 'V' },      // Vigintillion
		{ value: 1e60, suffix: 'Nd' },     // Novemdecillion
		{ value: 1e57, suffix: 'Od' },     // Octodecillion
		{ value: 1e54, suffix: 'Sd' },     // Septendecillion
		{ value: 1e51, suffix: 'Sx' },     // Sexdecillion
		{ value: 1e48, suffix: 'Qd' },     // Quindecillion
		{ value: 1e45, suffix: 'Qt' },     // Quattuordecillion
		{ value: 1e42, suffix: 'Td' },     // Tredecillion
		{ value: 1e39, suffix: 'Dd' },     // Duodecillion
		{ value: 1e36, suffix: 'Ud' },     // Undecillion
		{ value: 1e33, suffix: 'D' },      // Decillion
		{ value: 1e30, suffix: 'N' },      // Nonillion
		{ value: 1e27, suffix: 'O' },      // Octillion
		{ value: 1e24, suffix: 'Sp' },     // Septillion
		{ value: 1e21, suffix: 'Sx' },     // Sextillion
		{ value: 1e18, suffix: 'Qi' },     // Quintillion
		{ value: 1e15, suffix: 'Qa' },     // Quadrillion
		{ value: 1e12, suffix: 'T' },      // Trillion
		{ value: 1e9, suffix: 'B' },       // Billion
		{ value: 1e6, suffix: 'M' },       // Million
		{ value: 1e3, suffix: 'K' }        // Thousand
	];
	
	for (let unit of units) {
		if (score >= unit.value) {
			return (score / unit.value).toFixed(2) + ' ' + unit.suffix;
		}
	}
	
	return Math.floor(score).toString();
}

// Fonction pour mettre le classement à jour ainsi que pour afficher le joueur en bas tant qu'il n'est pas dans le top10
function updateLeaderboard() {
	const allPlayers = [
		...leaderboardData,
		{ name: playerName, score: totalMushroomsEver, isPlayer: true }
	];
	
	allPlayers.sort((a, b) => b.score - a.score);
	
	const playerIndex = allPlayers.findIndex(p => p.isPlayer);
	const playerRank = playerIndex + 1;
	
	const leaderboardList = document.querySelector('.leaderboard-list');
	leaderboardList.innerHTML = '';
	
	// Afficher le top 10
	const top10 = allPlayers.slice(0, 10);
	
	top10.forEach((player, index) => {
		const rank = index + 1;
		const item = document.createElement('div');
		item.className = 'leaderboard-item';
		
	if (rank <= 3) {
		item.classList.add(`rank-${rank}`);
	}
	
	if (player.isPlayer) {
		item.classList.add('player-highlight');
	}
	
	const displayEmoji = player.isPlayer ? equippedCosmetic : '🍄';
	
	item.innerHTML = `
		<span class="rank">${rank}</span>
		<span class="player-emoji">${displayEmoji}</span>
		<span class="player-name">${player.name}</span>
		<span class="player-score">${formatScore(player.score)} 🍄</span>
	`;		leaderboardList.appendChild(item);
	});
	
	// Ajouter la barre de séparation
	const separator = document.createElement('div');
	separator.className = 'leaderboard-separator';
	leaderboardList.appendChild(separator);
	
	// Afficher le reste des joueurs (du 11ème au dernier)
	const remainingPlayers = allPlayers.slice(10);
	
	remainingPlayers.forEach((player, index) => {
		const rank = index + 11;
		const item = document.createElement('div');
		item.className = 'leaderboard-item';
		
		if (player.isPlayer) {
			item.classList.add('player-highlight');
		}
		
		const displayEmoji = player.isPlayer ? equippedCosmetic : '🍄';
		
		item.innerHTML = `
			<span class="rank">${rank}</span>
			<span class="player-emoji">${displayEmoji}</span>
			<span class="player-name">${player.name}</span>
			<span class="player-score">${formatScore(player.score)} 🍄</span>
		`;
		
		leaderboardList.appendChild(item);
	});
}

updateLeaderboard();

// Fonction pour créer un feu d'artifice qui s'intensifie avec le grade
function createFireworks() {
	const colors = ['#ff6b6b', '#fbbf24', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
	const fireworksContainer = document.getElementById('falling-mushrooms');
	
	// Intensité basée sur le grade (1-17)
	const gradeLevel = previousGradeIndex + 1;
	const explosionCount = Math.min(3 + Math.floor(gradeLevel / 3), 10); // 3 à 10 explosions
	const particlesPerExplosion = Math.min(12 + gradeLevel * 2, 40); // 14 à 40 particules
	const particleSize = Math.min(8 + gradeLevel * 0.5, 16); // 8px à 16px
	const velocityMultiplier = 1 + (gradeLevel * 0.1); // Vitesse augmente avec le grade
	
	// Créer plusieurs explosions
	for (let i = 0; i < explosionCount; i++) {
		setTimeout(() => {
			const x = 20 + Math.random() * 60; // Position horizontale aléatoire (20-80%)
			const y = 20 + Math.random() * 40; // Position verticale aléatoire (20-60%)
			
			// Créer les particules pour cette explosion
			for (let j = 0; j < particlesPerExplosion; j++) {
				const particle = document.createElement('div');
				particle.className = 'firework-particle';
				particle.style.left = x + '%';
				particle.style.top = y + '%';
				particle.style.background = colors[Math.floor(Math.random() * colors.length)];
				particle.style.width = particleSize + 'px';
				particle.style.height = particleSize + 'px';
				
				// Angle de direction pour chaque particule
				const angle = (j / particlesPerExplosion) * Math.PI * 2;
				const baseVelocity = (100 + Math.random() * 100) * velocityMultiplier;
				const vx = Math.cos(angle) * baseVelocity;
				const vy = Math.sin(angle) * baseVelocity;
				
				particle.style.setProperty('--vx', vx + 'px');
				particle.style.setProperty('--vy', vy + 'px');
				
				fireworksContainer.appendChild(particle);
				
				// Supprimer la particule du fireworks à la fin
				setTimeout(() => particle.remove(), 1000);
			}
		}, i * 150);
	}
}