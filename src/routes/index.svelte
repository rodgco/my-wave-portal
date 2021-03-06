<script lang="ts">
	import { onMount } from 'svelte';
	import { ethers, providers } from 'ethers';
	import waveStore from '$lib/WavesStore';
	import type { EthereumWindow, Wave, WaveStore } from '../global';
	const contractAddress = <string>import.meta.env.VITE_CONTRACT_ADDRESS;

	let ethereum: providers.ExternalProvider;
	let provider: providers.Web3Provider;

	let connected: boolean = false;

	let value: string = '';

	let waves: WaveStore<Wave[]>;

	onMount(async () => {
		/*
		 * First make sure we have access to window.ethereum
		 */
		try {
			({ ethereum } = <EthereumWindow>(<unknown>window));
			if (!ethereum) return;

			provider = new ethers.providers.Web3Provider(ethereum);
			waves = waveStore(provider, contractAddress);

			/*
			 * Check if we're authorized to access the user's wallet
			 */
			const accounts = await ethereum.request({ method: 'eth_accounts' });
			if (accounts.length !== 0) {
				connected = true;
			} else {
				console.log('No authorized account found');
			}
		} catch (error) {
			console.log(error);
		}
	});

	async function connectWallet() {
		try {
			if (!ethereum) return;

			await ethereum.request({ method: 'eth_requestAccounts' });
			connected = true;
		} catch (error) {
			console.log(error);
		}
	}

	async function wave() {
		try {
			if (ethereum) {
				const signer = provider.getSigner();

				/*
				 * Execute the actual wave from your smart contract using the store
				 */
				waves.wave(signer, value);
				value = '';
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log('---', error.message);
		}
	}

	function formatAddress(address: string): string {
		return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
	}

	function formatTimeStamp(timestamp: number): string {
		const ts = new Date(timestamp * 1000);
		return ts.toLocaleString();
	}
</script>

<div class="mainContainer">
	<div class="dataContainer">
		<div class="header">👋 Hey there!</div>

		<div class="bio">
			I am <a href="https://twitter.com/rodg_co">rodgco</a> and I'm learning to develop web3 apps, that's
			pretty cool right? Connect your Ethereum wallet and wave at me!
		</div>

		{#if !ethereum || provider?.network?.name != 'rinkeby'}
			<div class="warning">
				You need a wallet to use this app! Try <a href="https://metamask.io">Metamask</a>. And it
				must be connected to the Rinkeby test network.
			</div>
		{:else}
			<div class="bio">Total waves: {$waves.length}</div>

			{#if connected}
				<form on:submit|preventDefault={wave}>
					<input type="text" placeholder="message" bind:value />
					<button type="submit" class="waveButton">Wave at Me</button>
				</form>
			{:else}
				<button class="waveButton" on:click={connectWallet}>Connect Wallet</button>
			{/if}

			<ul id="waves">
				{#each [...$waves].reverse() as wave}
					<li>
						<div class="message">{wave.message} {@html wave.winner ? '&#x1F3C6;' : ''}</div>
						<div class="meta">{formatAddress(wave.waver)} - {formatTimeStamp(wave.timestamp)}</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	form {
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-width: 600px;
	}

	input {
		padding: 0.5rem 0.75rem;
		margin-top: 1rem;
	}

	#waves {
		list-style-type: none;
	}

	#waves li {
		margin-bottom: 1rem;
	}
	#waves .message {
		font-weight: bold;
	}

	#waves .meta {
		font-size: 0.75rem;
		color: #444;
	}

	.mainContainer {
		display: flex;
		justify-content: center;
		width: 100%;
		margin-top: 64px;
	}

	.dataContainer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-width: 600px;
	}

	.header {
		text-align: center;
		font-size: 32px;
		font-weight: 600;
	}

	.bio {
		text-align: center;
		color: gray;
		margin-top: 16px;
	}

	.warning {
		text-align: center;
		color: #cf5d00;
		background: #e0d392;
		padding: 1rem;
		margin-top: 1rem;
		border: 2px solid #cf5d00;
		border-radius: 0.25rem;
	}

	.waveButton {
		margin-top: 16px;
		padding: 8px;
		border: 0;
		border-radius: 5px;
	}
</style>
