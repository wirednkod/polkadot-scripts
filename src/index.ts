/* eslint-disable @typescript-eslint/ban-ts-comment */
import yargs from 'yargs';
import { bagsHandler, electionScoreHandler, playgroundHandler, reapStashHandler, nominatorThreshHandler, chillOtherHandler, stateTrieMigrationHandler, stakingStatsHandler } from './handlers';


/**
 * Sample use of checking bags list but not sending a tx:
 * ```
 *  ts-node ./src/index.ts bags -w wss://kusama-rpc.polkadot.io
 * ```
 */
async function main() {
	await yargs
		.options({ // global options that apply to each command
			ws: {
				alias: 'w',
				description: 'the wss endpoint. It must allow unsafe RPCs.',
				default: "wss://rpc.polkadot.io",
				string: true,
				demandOption: false,
				global: true,
			},
			seed: {
				alias: 's',
				type: 'string',
				description: 'path to a raw text file that contains your raw or mnemonic seed, or its content. Can also be provided using SEED env variable',
				required: false,
				global: true,
			}
		})
		.command(
			['bags'],
			'check the bags list',
			// @ts-ignore
			(yargs) => {
				return yargs.options({
					sendTx: {
						alias: 'T',
						description: 'Whether or not to send a rebag tx.',
						boolean: true,
						demandOption: false,
						default: false,
					},
					count: {
						alias: 'c',
						description: 'How many rebag transactions to send. Iteration will stop if provided. All bags are iterated if  otherwise.',
						demandOption: false,
						number: true,
						default: -1,
					},
				});
			},
			bagsHandler
		)
		.command(
			['chill-other'],
			'check and try to submit the chill-other transaction to reduce staking nominators',
			// @ts-ignore
			(yargs) => {
				return yargs.options({
					sendTx: {
						alias: 'T',
						description: 'Whether or not to send a chill other tx.',
						boolean: true,
						demandOption: false,
						default: false,
					},
					count: {
						alias: 'c',
						description: 'Max amount of stakers to chill.',
						number: true,
						demandOption: false,
						default: -1,
					},
					noDryRun: {
						boolean: true,
						description: 'do not dry-run the command first. Advised not to set. Only set if you do not have access to local node with this RPC',
					}
				});
			},
			chillOtherHandler
		)
		// @ts-ignore
		.command(['noms-thresh'], 'Get number of stashes below threshold (needs improvement)', {}, nominatorThreshHandler)
		// @ts-ignore
		.command(['staking-stats'], 'Basic statistics of the staking limits', {}, stakingStatsHandler)
		.command(
			['election-score'],
			'Get stats on recent election scores',
			{},
			// @ts-ignore
			electionScoreHandler
		)
		// @ts-ignore
		.command(['reap-stash'], 'examine how many accounts can go through a reap-stash',
			(yargs) => {
				return yargs.options({
					sendTx: {
						alias: 'T',
						description: 'Whether or not to send a rebag tx.',
						boolean: true,
						demandOption: false,
						default: false,
					},
					count: {
						alias: 'c',
						description: 'How many rebag transactions to send. Iteration will stop if provided. All bags are iterated if  otherwise.',
						number: true,
						demandOption: false,
						default: -1,
					},
				});
			}, reapStashHandler
		)
		// @ts-ignore
		.command(['state-trie-migration'], 'Try and submit transactions to migrate the state trie version. See https://github.com/paritytech/substrate/pull/10073. This can only work against a node that supports dry-run RPC.',
			(yargs) => {
				return yargs.options({
					count: {
						description: 'Total number of transactions to send. Unlimited if not set.',
						number: true,
						demandOption: false,
					},
					'item-limit': {
						description: 'Number of items to try and migrate in each round',
						number: true,
						demandOption: true,
					},
					'size-limit': {
						description: 'size of items to try and migrate in each round',
						number: true,
						demandOption: true,
					},
				});
			}, stateTrieMigrationHandler
		)
		// @ts-ignore
		.command(['playground'], 'random stuff', {}, playgroundHandler)
		.parse();
}

main()
	.then(() => {
		console.info('Exiting ...');
		process.exit(0);
	})
	.catch(err => {
		console.error(err);
		process.exit(1);
	});
