import { writable } from 'svelte/store';
import type { Wave, WaveContract } from 'src/global';
import { ethers, providers } from 'ethers';
import type { Signer } from 'ethers';

import { abi } from '$lib/WavePortal.json';

export default function (provider: providers.Web3Provider, contractAddress: string) {
	const waves: Wave[] = [];

	const { set, update, subscribe } = writable(waves);

	const contract = <WaveContract>new ethers.Contract(contractAddress, abi, provider);

	async function init() {
		set(await contract.getAllWaves());
	}

	init();

	contract.on('NewWave', (waver, timestamp, message, winner) => {
		update((current) => [...current, { waver, timestamp, message, winner }]);
	});

	async function wave(signer: Signer, message: string) {
		try {
			const contract = new ethers.Contract(contractAddress, abi, signer);

			const txn = await contract.wave(message, { gasLimit: 300_000 });
			console.log('Mining:', txn.hash);
			await txn.wait();
			console.log('Mined:', txn.hash);
		} catch (error) {}
	}

	return { set, update, subscribe, wave };
}
