/// <reference types="@sveltejs/kit" />

import type { Contract, address, Signer, providers } from 'ethers';
import type { Writable } from 'sveltejs';

interface EthereumWindow extends Window {
	ethereum: providers.ExternalProvider;
}

interface Wave {
	waver: address;
	timestamp: number;
	message: string;
	winner: boolean;
}

interface WaveContract extends Contract {
	wave(message: string): void;
	getAllWaves(): Promise<WaveSctruct[]>;
	getTotalWaves(): Promise<number>;
}

interface WaveStore<T> extends Writable<T> {
	wave(signer: Signer, message: String): void;
}
